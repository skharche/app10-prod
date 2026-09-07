<?php
	// AI Agent configuration. Keys live in configParams.php (same treatment as the DB credentials in
	// dbconfig.php) - fill in whichever provider(s) you actually use.
	include(__DIR__."/../configParams.php");
	$aiAgentConfig = array();

	// Which provider actually answers questions. classes/aiAgent.php::callLLM() reads this and dispatches
	// to callGemini() / callClaude() / callChatGPT() accordingly. Valid values: "gemini", "claude", "chatgpt".
	$aiAgentConfig["provider"] = "gemini";

	$aiAgentConfig["providers"] = array(
		"gemini" => array(
			"api_key" => $config["gemini_api_key"],
			"model" => "gemini-3.6-flash", // gemini-2.5-flash was retired for new callers - Google's 404 pointed at this replacement
			"api_endpoint" => "https://generativelanguage.googleapis.com/v1beta/models/",
		),
		"claude" => array(
			// Get a key from https://console.anthropic.com (Settings > API Keys) - this is separate from
			// a claude.ai Pro/Max subscription, which does not include API access.
			"api_key" => $config["claude_api_key"],
			"model" => "claude-opus-5",
			"api_endpoint" => "https://api.anthropic.com/v1/messages",
			"anthropic_version" => "2023-06-01",
		),
		"chatgpt" => array(
			// Get a key from https://platform.openai.com/api-keys - separate from a ChatGPT Plus subscription.
			"api_key" => $config["openai_api_key"],
			"model" => "gpt-5", // verify this against your OpenAI dashboard - not independently confirmed current
			"api_endpoint" => "https://api.openai.com/v1/chat/completions",
		),
	);

	$aiAgentConfig["request_timeout_seconds"] = 20;

	// Lets the model search the web for questions that aren't answerable from the building/suite context alone
	// (e.g. "is this building popular with tenants?"). Wired up for Gemini (google_search) and Claude
	// (web_search) below; ChatGPT's call doesn't currently request a web tool - see callChatGPT() in aiAgent.php.
	$aiAgentConfig["enable_search_grounding"] = true;

	// Default question pills on the AI Agent tab now live in the tai_agent_questions table (type = "Office
	// Market", "Multifamily", "Hotel" or "AOS"), not here - see classes/aiAgent.php::getDefaultQuestionsByType()
	// and index.php, which bridges them to the frontend as window.aiAgentQuestionsByType.

	// System-wide cap on actual LLM calls per day, across whichever provider is active. Cached answers
	// (tai_agent_cache) don't count against this.
	$aiAgentConfig["daily_call_limit"] = 500;

	// Per idtuser caps. Cached answers don't count against these either - only real API calls do
	// (see tai_agent_usage_log, written only on a cache miss).
	$aiAgentConfig["max_calls_per_user"] = 50;
	$aiAgentConfig["max_calls_per_building"] = 10;
	$aiAgentConfig["max_calls_per_suite"] = 5;

	// Set to false to silence classes/aiAgent.php's error_log() calls on LLM request failures.
	$aiAgentConfig["log_errors"] = true;

	// Set to true to also log every step of askQuestion() (received question, cache hit/miss, limit check
	// result, LLM request/response) via error_log(), prefixed "[aiAgent DEBUG]". Leave off in production -
	// this logs full questions/answers.
	$aiAgentConfig["debug_mode"] = true;
?>
