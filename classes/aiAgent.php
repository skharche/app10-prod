<?php
if(!defined("aiAgent"))
{
	define("aiAgent",1);
	/************************************************************************************************************************/
	/*		Included files																									*/
	/************************************************************************************************************************/
	include_once(__DIR__."/connection.php");
	include_once(__DIR__."/aiAgentConfig.php");
	/************************************************************************************************************************/

	class aiAgent
	{
		//$contextType is a building-level context ("Office Market", "Multifamily" or "Hotel" - no suite
		//involved) or "AOS" (suite-level, the original behavior). Building-level contexts control two things:
		//idtsuite is forced to the 0 "no suite" sentinel for cache/rate-limit keys, and logUsage() records a
		//real SQL NULL for idtsuite (not 0) so usage rows are honestly "no suite" rather than looking like
		//suite id 0. (buildContext() sends Building + City for every context alike.) The contextType also
		//selects which tai_agent_questions.type set the frontend shows (see getDefaultQuestionsByType()).
		//$questionId is the tai_agent_questions.idtai_agent_questions of the predefined question that was
		//clicked, or 0 for a free-typed question. Only a non-zero id bumps that row's ask_count.
		function askQuestion($idtuser, $idtcity, $idtmarket, $idtbuilding, $idtsuite, $question, $contextType = "AOS", $questionId = 0)
		{
			global $aiAgentConfig;
			//Wrapped so any unexpected failure (DB connection drop, a malformed row, etc.) still comes back as a
			//normal "soft" JSON error the frontend already knows how to render, instead of a raw PHP
			//fatal/warning breaking the AJAX response and leaving the tab stuck on "Thinking...".
			try
			{
				$idtuser = (int)$idtuser;
				$idtcity = (int)$idtcity;
				$idtmarket = (int)$idtmarket;
				$idtbuilding = (int)$idtbuilding;
				$idtsuite = (int)$idtsuite;
				$question = trim($question);
				$questionId = (int)$questionId;
				$contextType = $this->isBuildingLevelContext($contextType) ? $contextType : "AOS";
				if($this->isBuildingLevelContext($contextType))
					$idtsuite = 0;

				$this->debugLog("askQuestion called", array("idtuser" => $idtuser, "idtcity" => $idtcity, "idtmarket" => $idtmarket, "idtbuilding" => $idtbuilding, "idtsuite" => $idtsuite, "contextType" => $contextType, "question" => $question));

				if($question == "")
					return array("status" => "error", "message" => "Please enter a question.");
				if($idtuser <= 0)
					return array("status" => "error", "message" => "Please log in to use the AI Agent.");
				if($idtbuilding <= 0)
					return array("status" => "error", "message" => "Select a building first.");

				$conn = new dbConnection();
				$mysqliObj = $conn->Connect();

				//Counts every ask of a predefined question (cache hit or miss) - see method below.
				if($questionId > 0)
					$this->incrementQuestionAskCount($mysqliObj, $questionId);

				$questionHash = hash("sha256", strtolower($question));

				//Shared cache, keyed by building/suite/question - not by user, so the first person to ask a given
				//question pays the Gemini call and everyone after gets the cached answer for free.
				$cached = $this->getCachedAnswer($mysqliObj, $idtbuilding, $idtsuite, $questionHash);
				if($cached != null)
				{
					$this->debugLog("cache hit", array("idtbuilding" => $idtbuilding, "idtsuite" => $idtsuite, "question_hash" => $questionHash));
					return array("status" => "success", "answer" => $cached["answer"], "sources" => json_decode($cached["sources"], true), "cached" => true);
				}
				$this->debugLog("cache miss", array("idtbuilding" => $idtbuilding, "idtsuite" => $idtsuite, "question_hash" => $questionHash));

				//Only real API calls (cache misses) count against the daily/user/building/suite limits below.
				$limitCheck = $this->checkLimits($mysqliObj, $idtuser, $idtbuilding, $idtsuite);
				$this->debugLog("limit check result", $limitCheck);
				if($limitCheck["status"] != "ok")
				{
					return array("status" => "limit_exceeded", "scope" => $limitCheck["scope"], "message" => $limitCheck["message"]);
				}

				$context = $this->buildContext($mysqliObj, $idtcity, $idtmarket, $idtbuilding, $idtsuite, $contextType);
				$primaryProvider = $aiAgentConfig["provider"];
				$this->debugLog("calling ".$primaryProvider, array("context" => $context, "question" => $question));
				$result = $this->callLLM($question, $context, $primaryProvider);
				$this->debugLog($primaryProvider." result", $result);
				if($result["status"] != "success")
				{
					//The provider's own call failed (bad HTTP status, curl error, or an empty answer) - record
					//it for the exception report and return the error to the frontend as-is. There is no
					//fallback to a different provider: Gemini is the only provider this feature uses.
					$this->logException($mysqliObj, $idtuser, $idtbuilding, $idtsuite, $contextType, $question,
						$primaryProvider, $aiAgentConfig["providers"][$primaryProvider]["model"], $result);
					return $result;
				}

				$inputTokens = isset($result["input_tokens"]) ? $result["input_tokens"] : 0;
				$outputTokens = isset($result["output_tokens"]) ? $result["output_tokens"] : 0;

				$this->saveCache($mysqliObj, $idtuser, $idtbuilding, $idtsuite, $questionHash, $question, $result["answer"], $result["sources"], $inputTokens, $outputTokens);
				$logIdtsuite = $this->isBuildingLevelContext($contextType) ? null : $idtsuite;
				$this->logUsage($mysqliObj, $idtuser, $idtbuilding, $logIdtsuite, $questionHash, $inputTokens, $outputTokens);

				return array("status" => "success", "answer" => $result["answer"], "sources" => $result["sources"], "cached" => false);
			}
			catch(\Throwable $e)
			{
				if($aiAgentConfig["log_errors"])
					error_log("aiAgent::askQuestion threw: ".$e->getMessage()." in ".$e->getFile().":".$e->getLine());
				//Best-effort - only if a DB connection actually got established before this was thrown
				//(e.g. it broke mid-request); a connection-level failure obviously can't log itself.
				if(isset($mysqliObj) && $mysqliObj)
				{
					$this->logException($mysqliObj, $idtuser, $idtbuilding, $idtsuite, $contextType, $question,
						isset($primaryProvider) ? $primaryProvider : $aiAgentConfig["provider"], "", array("message" => $e->getMessage()." in ".$e->getFile().":".$e->getLine()));
				}
				return array("status" => "error", "message" => "The AI Agent hit an unexpected error. Please try again.");
			}
		}

		function debugLog($message, $data = null)
		{
			global $aiAgentConfig;
			if(!$aiAgentConfig["debug_mode"])
				return;
			$line = "[aiAgent DEBUG] ".$message;
			if($data !== null)
				$line .= " - ".json_encode($data);
			error_log($line);
		}

		//Building-level contexts: whole-building questions, no suite. "AOS" is the only suite-level context.
		//These are also the tai_agent_questions.type values the matching visualisation panels pull their pills
		//from (getDefaultQuestionsByType()).
		function isBuildingLevelContext($contextType)
		{
			return in_array($contextType, array("Office Market", "Multifamily", "Hotel"), true);
		}

		//Bumps tai_agent_questions.ask_count for the predefined question with this id. Called on every ask of
		//a pill (cache hit or miss); free-typed questions pass id 0 and never reach here.
		function incrementQuestionAskCount($mysqliObj, $questionId)
		{
			$q = "UPDATE tai_agent_questions SET ask_count = ask_count + 1
				WHERE idtai_agent_questions = ".(int)$questionId;
			mysqli_query($mysqliObj, $q);
		}

		function getCachedAnswer($mysqliObj, $idtbuilding, $idtsuite, $questionHash)
		{
			$q = "SELECT answer, sources FROM tai_agent_cache
				WHERE idtbuilding = ".(int)$idtbuilding." AND idtsuite = ".(int)$idtsuite." AND question_hash = '".mysqli_real_escape_string($mysqliObj, $questionHash)."'
				LIMIT 1";
			if($result = mysqli_query($mysqliObj, $q))
			{
				$row = mysqli_fetch_assoc($result);
				return $row != null ? $row : null;
			}
			return null;
		}

		function checkLimits($mysqliObj, $idtuser, $idtbuilding, $idtsuite)
		{
			global $aiAgentConfig;

			//The daily cap protects everyone's shared Gemini budget, so it applies even to flagged users below -
			//only the per-user/building/suite quotas are skippable.
			$dailyCount = $this->countUsage($mysqliObj, "DATE(date_created) = CURDATE()");
			if($dailyCount >= $aiAgentConfig["daily_call_limit"])
				return array("status" => "blocked", "scope" => "daily", "message" => "The AI Agent has reached its question limit for today. Please try again tomorrow.");

			$userLimits = $this->getUserLimits($mysqliObj, $idtuser);

			if($userLimits["skip_limit_check"])
			{
				$this->debugLog("skip_limit_check set for idtuser, bypassing user/building/suite limits", array("idtuser" => $idtuser));
				return array("status" => "ok");
			}

			$userCount = $this->countUsage($mysqliObj, "idtuser = ".(int)$idtuser);
			if($userCount >= $userLimits["max_calls_per_user"])
				return array("status" => "blocked", "scope" => "user", "message" => "You've reached your limit of ".$userLimits["max_calls_per_user"]." AI Agent questions.");

			$buildingCount = $this->countUsage($mysqliObj, "idtuser = ".(int)$idtuser." AND idtbuilding = ".(int)$idtbuilding);
			if($buildingCount >= $userLimits["max_calls_per_building"])
				return array("status" => "blocked", "scope" => "building", "message" => "You've reached your limit of ".$userLimits["max_calls_per_building"]." AI Agent questions for this building.");

			if($idtsuite > 0)
			{
				$suiteCount = $this->countUsage($mysqliObj, "idtuser = ".(int)$idtuser." AND idtsuite = ".(int)$idtsuite);
				if($suiteCount >= $userLimits["max_calls_per_suite"])
					return array("status" => "blocked", "scope" => "suite", "message" => "You've reached your limit of ".$userLimits["max_calls_per_suite"]." AI Agent questions for this suite.");
			}

			return array("status" => "ok");
		}

		function countUsage($mysqliObj, $whereClause)
		{
			$q = "SELECT COUNT(*) as cnt FROM tai_agent_usage_log WHERE ".$whereClause;
			if($result = mysqli_query($mysqliObj, $q))
			{
				$row = mysqli_fetch_assoc($result);
				return (int)$row["cnt"];
			}
			return 0;
		}

		//Per-user overrides live in tai_agent_user_config (idtuser unique) - falls back to the defaults in
		//classes/aiAgentConfig.php for every user without a row there. skip_limit_check (0/1) lets a specific
		//idtuser bypass the user/building/suite quotas entirely - set it directly on that user's row.
		function getUserLimits($mysqliObj, $idtuser)
		{
			global $aiAgentConfig;
			$q = "SELECT max_calls_per_user, max_calls_per_building, max_calls_per_suite, skip_limit_check FROM tai_agent_user_config WHERE idtuser = ".(int)$idtuser." LIMIT 1";
			if($result = mysqli_query($mysqliObj, $q))
			{
				$row = mysqli_fetch_assoc($result);
				if($row != null)
				{
					return array(
						"max_calls_per_user" => (int)$row["max_calls_per_user"],
						"max_calls_per_building" => (int)$row["max_calls_per_building"],
						"max_calls_per_suite" => (int)$row["max_calls_per_suite"],
						"skip_limit_check" => (bool)$row["skip_limit_check"]
					);
				}
			}
			return array(
				"max_calls_per_user" => $aiAgentConfig["max_calls_per_user"],
				"max_calls_per_building" => $aiAgentConfig["max_calls_per_building"],
				"max_calls_per_suite" => $aiAgentConfig["max_calls_per_suite"],
				"skip_limit_check" => false
			);
		}

		//Just building name + city - minimal grounding so the model knows which property/city is being asked
		//about (the city disambiguates buildings with common names across markets). Sent for every context,
		//suite-level and building-level alike. The model relies on Google Search (see callGemini()) for
		//everything else. There's never suite-level data here regardless of $contextType.
		function buildContext($mysqliObj, $idtcity, $idtmarket, $idtbuilding, $idtsuite, $contextType = "AOS")
		{
			$lines = array();

			$q = "SELECT tbuilding.sbuildingname, tcity.scityname
				FROM tbuilding
				LEFT JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
				LEFT JOIN tcity ON tcity.idtcity = tsubmarket.idtcity
				WHERE tbuilding.idtbuilding = ".(int)$idtbuilding." LIMIT 1";
			if($result = mysqli_query($mysqliObj, $q))
			{
				$row = mysqli_fetch_assoc($result);
				if($row != null)
				{
					$lines[] = "Building: ".$row["sbuildingname"];
					if($row["scityname"] != "") $lines[] = "City: ".$row["scityname"];
				}
			}

			return implode("\n", $lines);
		}

		//Common system instruction for every provider - same wording regardless of which one is active.
		function getSystemInstruction()
		{
			return "You are the AI Agent for Floorplan City, a commercial real estate exploration tool. ".
				"The context given to you only tells you the building name and city - use web search for everything ".
				"else needed to answer the question (address, class, size, amenities, reputation, tenant satisfaction, ".
				"known issues, etc.), summarizing what you find and citing your sources. If you can't find a reliable ".
				"answer, say so plainly instead of guessing. Keep answers concise.";
		}

		function buildPrompt($question, $context)
		{
			if($context == "")
				return $question;
			return "Context:\n".$context."\n\nQuestion: ".$question;
		}

		//Dispatches to $provider (defaults to $aiAgentConfig["provider"] when omitted - askQuestion() always
		//passes one explicitly). All three return the same shape:
		//array("status" => "success"|"error", "answer" => ..., "sources" => [["uri"=>...,"title"=>...], ...]),
		//plus (on error) "http_code"/"curl_error"/"raw_response" for logException()'s benefit.
		function callLLM($question, $context, $provider = null)
		{
			global $aiAgentConfig;
			if($provider == null)
				$provider = $aiAgentConfig["provider"];
			switch($provider)
			{
				case "claude":
					return $this->callClaude($question, $context);
				case "chatgpt":
					return $this->callChatGPT($question, $context);
				case "gemini":
					return $this->callGemini($question, $context);
				default:
					return array("status" => "error", "message" => "The AI Agent's provider (\"".$provider."\") isn't recognized - set aiAgentConfig[\"provider\"] to \"gemini\", \"claude\", or \"chatgpt\".");
			}
		}

		//Records a failed LLM call (and, if one was attempted, the fallback provider's outcome) to
		//tai_agent_exceptions - see sql/ai_agent_exceptions.sql. $result is the failed call's own return
		//array (from callGemini()/callClaude()/callChatGPT(), or a synthetic one for a caught Throwable),
		//read for the http_code/curl_error/raw_response detail those methods attach on failure.
		function logException($mysqliObj, $idtuser, $idtbuilding, $idtsuite, $contextType, $question, $provider, $model, $result, $fallbackProvider = null, $retryStatus = null)
		{
			global $aiAgentConfig;
			try
			{
				$httpCode = isset($result["http_code"]) && $result["http_code"] !== null ? (int)$result["http_code"] : null;
				$exceptionMessage = isset($result["raw_response"]) && $result["raw_response"] != "" ? $result["raw_response"] : (isset($result["message"]) ? $result["message"] : "");
				if(isset($result["curl_error"]) && $result["curl_error"] != "")
					$exceptionMessage = "curl error: ".$result["curl_error"]." | ".$exceptionMessage;

				$q = "INSERT INTO tai_agent_exceptions
					(idtuser, idtbuilding, idtsuite, contextType, question, provider, model, http_code, exception_message, fallback_provider, retry_status, date_created)
					VALUES (".(int)$idtuser.",
						".($idtbuilding !== null ? (int)$idtbuilding : "NULL").",
						".($idtsuite !== null ? (int)$idtsuite : "NULL").",
						'".mysqli_real_escape_string($mysqliObj, (string)$contextType)."',
						'".mysqli_real_escape_string($mysqliObj, (string)$question)."',
						'".mysqli_real_escape_string($mysqliObj, (string)$provider)."',
						'".mysqli_real_escape_string($mysqliObj, (string)$model)."',
						".($httpCode !== null ? (int)$httpCode : "NULL").",
						'".mysqli_real_escape_string($mysqliObj, (string)$exceptionMessage)."',
						".($fallbackProvider != null ? "'".mysqli_real_escape_string($mysqliObj, $fallbackProvider)."'" : "NULL").",
						".($retryStatus != null ? "'".mysqli_real_escape_string($mysqliObj, $retryStatus)."'" : "NULL").",
						NOW())";
				if(!mysqli_query($mysqliObj, $q) && $aiAgentConfig["log_errors"])
					error_log("aiAgent::logException insert failed: ".mysqli_error($mysqliObj));
			}
			catch(\Throwable $e)
			{
				if($aiAgentConfig["log_errors"])
					error_log("aiAgent::logException threw: ".$e->getMessage());
			}
		}

		//Feeds the AI Agent exceptions report. $filters (all optional):
		//  "idtuser"  - exact user id
		//  "search"   - matches user first/last name or email (LIKE, "search by user")
		//  "dateFrom"/"dateTo" - "YYYY-MM-DD"; both default to today when neither is given, so a fresh
		//                        report load shows today's exceptions rather than the whole table.
		//  "limit"    - row cap, default 500
		function getExceptions($filters = array())
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();

			$idtuser = isset($filters["idtuser"]) ? (int)$filters["idtuser"] : 0;
			$search = isset($filters["search"]) ? trim($filters["search"]) : "";
			$dateFrom = isset($filters["dateFrom"]) ? trim($filters["dateFrom"]) : "";
			$dateTo = isset($filters["dateTo"]) ? trim($filters["dateTo"]) : "";
			$limit = isset($filters["limit"]) && (int)$filters["limit"] > 0 ? (int)$filters["limit"] : 500;

			if($dateFrom == "" && $dateTo == "")
			{
				$dateFrom = date("Y-m-d");
				$dateTo = date("Y-m-d");
			}

			$where = array("1=1");
			if($idtuser > 0)
				$where[] = "tai_agent_exceptions.idtuser = ".$idtuser;
			if($search != "")
			{
				$searchEsc = mysqli_real_escape_string($mysqliObj, $search);
				$where[] = "(tuser.firstname LIKE '%".$searchEsc."%' OR tuser.lastname LIKE '%".$searchEsc."%' OR tuser.email LIKE '%".$searchEsc."%')";
			}
			if($dateFrom != "")
				$where[] = "tai_agent_exceptions.date_created >= '".mysqli_real_escape_string($mysqliObj, $dateFrom)." 00:00:00'";
			if($dateTo != "")
				$where[] = "tai_agent_exceptions.date_created <= '".mysqli_real_escape_string($mysqliObj, $dateTo)." 23:59:59'";

			$q = "SELECT tai_agent_exceptions.*, CONCAT_WS(' ', tuser.firstname, tuser.lastname) AS username, tuser.email AS useremail
				FROM tai_agent_exceptions
				LEFT JOIN tuser ON tuser.idtuser = tai_agent_exceptions.idtuser
				WHERE ".implode(" AND ", $where)."
				ORDER BY tai_agent_exceptions.date_created DESC
				LIMIT ".$limit;

			$rows = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($row = mysqli_fetch_assoc($result))
					$rows[] = $row;
			}
			return array("status" => "success", "data" => $rows, "dateFrom" => $dateFrom, "dateTo" => $dateTo);
		}

		function callGemini($question, $context)
		{
			global $aiAgentConfig;
			$providerConfig = $aiAgentConfig["providers"]["gemini"];

			if($providerConfig["api_key"] == "")
				return array("status" => "error", "message" => "The AI Agent isn't configured yet - add a Gemini API key to configParams.php.");

			$requestBody = array(
				"system_instruction" => array("parts" => array(array("text" => $this->getSystemInstruction()))),
				"contents" => array(array("role" => "user", "parts" => array(array("text" => $this->buildPrompt($question, $context)))))
			);
			if($aiAgentConfig["enable_search_grounding"])
			{
				$requestBody["tools"] = array(array("google_search" => new stdClass()));
			}

			$url = $providerConfig["api_endpoint"].$providerConfig["model"].":generateContent?key=".$providerConfig["api_key"];

			$ch = curl_init($url);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
			curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
			curl_setopt($ch, CURLOPT_TIMEOUT, $aiAgentConfig["request_timeout_seconds"]);
			$response = curl_exec($ch);
			$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
			$curlError = curl_error($ch);
			curl_close($ch);

			$this->debugLog("Gemini HTTP response", array("http_code" => $httpCode, "curl_error" => $curlError, "response" => $response));

			if($response === false || $httpCode < 200 || $httpCode >= 300)
			{
				if($aiAgentConfig["log_errors"])
					error_log("aiAgent::callGemini failed - HTTP ".$httpCode.", curl error: ".$curlError.", response: ".$response);
				//429 (quota/rate-limit exhausted) is a distinct, actionable case worth telling the user about
				//separately from a generic failure - everything else (network errors, bad model name, etc.)
				//stays the generic message so we're not guessing at causes we can't actually diagnose here.
				if($httpCode == 429)
					return array("status" => "error", "message" => "The AI Agent has hit Google's Gemini API rate limit for this account. Please try again in a little while, or check the plan/billing details at https://ai.google.dev/gemini-api/docs/rate-limits.", "http_code" => $httpCode, "curl_error" => $curlError, "raw_response" => $response);
				return array("status" => "error", "message" => "The AI Agent couldn't get an answer right now. Please try again.", "http_code" => $httpCode, "curl_error" => $curlError, "raw_response" => $response);
			}

			$data = json_decode($response, true);
			$answerText = "";
			$sources = array();
			if(isset($data["candidates"][0]["content"]["parts"]))
			{
				foreach($data["candidates"][0]["content"]["parts"] as $part)
				{
					if(isset($part["text"]))
						$answerText .= $part["text"];
				}
			}
			if(isset($data["candidates"][0]["groundingMetadata"]["groundingChunks"]))
			{
				foreach($data["candidates"][0]["groundingMetadata"]["groundingChunks"] as $chunk)
				{
					if(isset($chunk["web"]["uri"]))
						$sources[] = array("uri" => $chunk["web"]["uri"], "title" => isset($chunk["web"]["title"]) ? $chunk["web"]["title"] : $chunk["web"]["uri"]);
				}
			}

			if($answerText == "")
			{
				if($aiAgentConfig["log_errors"])
					error_log("aiAgent::callGemini got an empty answer, response: ".$response);
				return array("status" => "error", "message" => "The AI Agent couldn't get an answer right now. Please try again.", "http_code" => $httpCode, "raw_response" => $response);
			}

			$inputTokens = isset($data["usageMetadata"]["promptTokenCount"]) ? (int)$data["usageMetadata"]["promptTokenCount"] : 0;
			$outputTokens = isset($data["usageMetadata"]["candidatesTokenCount"]) ? (int)$data["usageMetadata"]["candidatesTokenCount"] : 0;

			return array("status" => "success", "answer" => $answerText, "sources" => $sources, "input_tokens" => $inputTokens, "output_tokens" => $outputTokens);
		}

		//Raw HTTP against Anthropic's Messages API (no SDK dependency - this project has no working Composer
		//setup, and the Gemini integration above already established a raw-cURL pattern for this feature).
		//web_search is Anthropic's server-side search tool - the Claude equivalent of Gemini's google_search
		//above. Get a key from https://console.anthropic.com (Settings > API Keys) - a claude.ai Pro/Max
		//subscription does NOT include API access, it's billed separately.
		function callClaude($question, $context)
		{
			global $aiAgentConfig;
			$providerConfig = $aiAgentConfig["providers"]["claude"];

			if($providerConfig["api_key"] == "")
				return array("status" => "error", "message" => "The AI Agent isn't configured yet - add a Claude API key to configParams.php.");

			$requestBody = array(
				"model" => $providerConfig["model"],
				"max_tokens" => 2048,
				"system" => $this->getSystemInstruction(),
				"messages" => array(array("role" => "user", "content" => $this->buildPrompt($question, $context)))
			);
			if($aiAgentConfig["enable_search_grounding"])
			{
				$requestBody["tools"] = array(array("type" => "web_search_20260209", "name" => "web_search"));
			}

			$ch = curl_init($providerConfig["api_endpoint"]);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array(
				"Content-Type: application/json",
				"x-api-key: ".$providerConfig["api_key"],
				"anthropic-version: ".$providerConfig["anthropic_version"]
			));
			curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
			curl_setopt($ch, CURLOPT_TIMEOUT, $aiAgentConfig["request_timeout_seconds"]);
			$response = curl_exec($ch);
			$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
			$curlError = curl_error($ch);
			curl_close($ch);

			$this->debugLog("Claude HTTP response", array("http_code" => $httpCode, "curl_error" => $curlError, "response" => $response));

			if($response === false || $httpCode < 200 || $httpCode >= 300)
			{
				if($aiAgentConfig["log_errors"])
					error_log("aiAgent::callClaude failed - HTTP ".$httpCode.", curl error: ".$curlError.", response: ".$response);
				if($httpCode == 429)
					return array("status" => "error", "message" => "The AI Agent has hit Anthropic's API rate limit for this account. Please try again in a little while, or check https://console.anthropic.com for plan/credit details.", "http_code" => $httpCode, "curl_error" => $curlError, "raw_response" => $response);
				return array("status" => "error", "message" => "The AI Agent couldn't get an answer right now. Please try again.", "http_code" => $httpCode, "curl_error" => $curlError, "raw_response" => $response);
			}

			$data = json_decode($response, true);
			$answerText = "";
			$sources = array();
			if(isset($data["content"]) && is_array($data["content"]))
			{
				foreach($data["content"] as $block)
				{
					if(isset($block["type"]) && $block["type"] == "text" && isset($block["text"]))
						$answerText .= $block["text"];
					//web_search_tool_result content is a list of web_search_result objects on success, or a
					//single error object on failure - only walk it when it's a list.
					if(isset($block["type"]) && $block["type"] == "web_search_tool_result" && isset($block["content"]) && is_array($block["content"]) && array_key_exists(0, $block["content"]))
					{
						foreach($block["content"] as $result)
						{
							if(isset($result["url"]))
								$sources[] = array("uri" => $result["url"], "title" => isset($result["title"]) ? $result["title"] : $result["url"]);
						}
					}
				}
			}

			if($answerText == "")
			{
				if($aiAgentConfig["log_errors"])
					error_log("aiAgent::callClaude got an empty answer, response: ".$response);
				return array("status" => "error", "message" => "The AI Agent couldn't get an answer right now. Please try again.", "http_code" => $httpCode, "raw_response" => $response);
			}

			$inputTokens = isset($data["usage"]["input_tokens"]) ? (int)$data["usage"]["input_tokens"] : 0;
			$outputTokens = isset($data["usage"]["output_tokens"]) ? (int)$data["usage"]["output_tokens"] : 0;

			return array("status" => "success", "answer" => $answerText, "sources" => $sources, "input_tokens" => $inputTokens, "output_tokens" => $outputTokens);
		}

		//Raw HTTP against OpenAI's Chat Completions API. Get a key from https://platform.openai.com/api-keys -
		//a ChatGPT Plus subscription does NOT include API access, it's billed separately.
		//NOTE: unlike callGemini()/callClaude() above, this does not request a web-search tool - OpenAI's
		//current tool-calling shape for web search wasn't verified against live docs when this was written,
		//so answers here rely on the model's own knowledge only. Revisit if grounded answers matter for ChatGPT.
		function callChatGPT($question, $context)
		{
			global $aiAgentConfig;
			$providerConfig = $aiAgentConfig["providers"]["chatgpt"];

			if($providerConfig["api_key"] == "")
				return array("status" => "error", "message" => "The AI Agent isn't configured yet - add an OpenAI API key to configParams.php.");

			$requestBody = array(
				"model" => $providerConfig["model"],
				"messages" => array(
					array("role" => "system", "content" => $this->getSystemInstruction()),
					array("role" => "user", "content" => $this->buildPrompt($question, $context))
				)
			);

			$ch = curl_init($providerConfig["api_endpoint"]);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array(
				"Content-Type: application/json",
				"Authorization: Bearer ".$providerConfig["api_key"]
			));
			curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
			curl_setopt($ch, CURLOPT_TIMEOUT, $aiAgentConfig["request_timeout_seconds"]);
			$response = curl_exec($ch);
			$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
			$curlError = curl_error($ch);
			curl_close($ch);

			$this->debugLog("ChatGPT HTTP response", array("http_code" => $httpCode, "curl_error" => $curlError, "response" => $response));

			if($response === false || $httpCode < 200 || $httpCode >= 300)
			{
				if($aiAgentConfig["log_errors"])
					error_log("aiAgent::callChatGPT failed - HTTP ".$httpCode.", curl error: ".$curlError.", response: ".$response);
				if($httpCode == 429)
				{
					//OpenAI returns 429 for two different situations distinguished only by error.type/code -
					//actual rate limiting (too many requests/tokens per minute) vs. insufficient_quota (no
					//billing/credits on the key's project, or a spending cap hit). They need different action
					//from the user, so tell them apart instead of collapsing both into "try again later".
					$errorData = json_decode($response, true);
					$errorCode = isset($errorData["error"]["code"]) ? $errorData["error"]["code"] : "";
					if($errorCode == "insufficient_quota")
						return array("status" => "error", "message" => "This OpenAI API key's project has no billing/credits set up (a ChatGPT Plus subscription doesn't cover API usage) - add a payment method at https://platform.openai.com under Settings > Billing.", "http_code" => $httpCode, "curl_error" => $curlError, "raw_response" => $response);
					return array("status" => "error", "message" => "The AI Agent has hit OpenAI's API rate limit for this account. Please try again in a little while, or check https://platform.openai.com for plan/billing details.", "http_code" => $httpCode, "curl_error" => $curlError, "raw_response" => $response);
				}
				return array("status" => "error", "message" => "The AI Agent couldn't get an answer right now. Please try again.", "http_code" => $httpCode, "curl_error" => $curlError, "raw_response" => $response);
			}

			$data = json_decode($response, true);
			$answerText = "";
			if(isset($data["choices"][0]["message"]["content"]))
				$answerText = $data["choices"][0]["message"]["content"];

			if($answerText == "")
			{
				if($aiAgentConfig["log_errors"])
					error_log("aiAgent::callChatGPT got an empty answer, response: ".$response);
				return array("status" => "error", "message" => "The AI Agent couldn't get an answer right now. Please try again.", "http_code" => $httpCode, "raw_response" => $response);
			}

			$inputTokens = isset($data["usage"]["prompt_tokens"]) ? (int)$data["usage"]["prompt_tokens"] : 0;
			$outputTokens = isset($data["usage"]["completion_tokens"]) ? (int)$data["usage"]["completion_tokens"] : 0;

			return array("status" => "success", "answer" => $answerText, "sources" => array(), "input_tokens" => $inputTokens, "output_tokens" => $outputTokens);
		}

		//idtuser here is attribution (who asked the question that first produced this cached answer), not a
		//cache scope - the cache itself stays shared across all users for a given building/suite/question.
		//input_tokens/output_tokens are the cost of the one real API call that created this row; a cache hit
		//never calls the provider again, so this is also the total token cost this question will ever incur.
		function saveCache($mysqliObj, $idtuser, $idtbuilding, $idtsuite, $questionHash, $question, $answer, $sources, $inputTokens, $outputTokens)
		{
			$q = "INSERT INTO tai_agent_cache (idtbuilding, idtsuite, idtuser, question_hash, question, answer, input_tokens, output_tokens, sources)
				VALUES (".(int)$idtbuilding.", ".(int)$idtsuite.", ".(int)$idtuser.", '".mysqli_real_escape_string($mysqliObj, $questionHash)."', '".mysqli_real_escape_string($mysqliObj, $question)."', '".mysqli_real_escape_string($mysqliObj, $answer)."', ".(int)$inputTokens.", ".(int)$outputTokens.", '".mysqli_real_escape_string($mysqliObj, json_encode($sources))."')
				ON DUPLICATE KEY UPDATE answer = VALUES(answer), sources = VALUES(sources), input_tokens = VALUES(input_tokens), output_tokens = VALUES(output_tokens)";
			mysqli_query($mysqliObj, $q);
		}

		//$idtsuite is nullable here specifically (unlike everywhere else in this class, where 0 is the "no
		//suite" sentinel) - askQuestion() passes null for Office Market questions so this table honestly
		//records "no suite" as SQL NULL instead of a suite id of 0.
		function logUsage($mysqliObj, $idtuser, $idtbuilding, $idtsuite, $questionHash, $inputTokens, $outputTokens)
		{
			$idtsuiteSql = ($idtsuite === null) ? "NULL" : (string)(int)$idtsuite;
			$q = "INSERT INTO tai_agent_usage_log (idtuser, idtbuilding, idtsuite, question_hash, input_tokens, output_tokens)
				VALUES (".(int)$idtuser.", ".(int)$idtbuilding.", ".$idtsuiteSql.", '".mysqli_real_escape_string($mysqliObj, $questionHash)."', ".(int)$inputTokens.", ".(int)$outputTokens.")";
			mysqli_query($mysqliObj, $q);
		}

		//Feeds the AI Agent tab's clickable question pills (see aiAgent.js) - grouped by type so the frontend
		//can show the right set per context: the AOS suite panel vs. the building-level panels on the Office
		//Market, Multifamily and Hotel visualisations.
		function getDefaultQuestionsByType($mysqliObj)
		{
			$result = array("Office Market" => array(), "Multifamily" => array(), "Hotel" => array(), "AOS" => array());
			$q = "SELECT idtai_agent_questions, type, question FROM tai_agent_questions WHERE is_active = 1 ORDER BY type, sort_order, idtai_agent_questions";
			if($r = mysqli_query($mysqliObj, $q))
			{
				while($row = mysqli_fetch_assoc($r))
				{
					if(!isset($result[$row["type"]]))
						$result[$row["type"]] = array();
					//{id, question} - the frontend sends the id back so ask_count is tracked by row, not text.
					$result[$row["type"]][] = array("id" => (int)$row["idtai_agent_questions"], "question" => $row["question"]);
				}
			}
			return $result;
		}
	}
	/************************************************************************************************************************/
}
?>
