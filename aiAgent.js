//AI Agent tab (AOS infobox "Amenities" pane, relabeled "AI Agent" - see prepareSuiteImagesTabStructure() in
//main.js, which renders buildAIAgentPanel()'s markup into that pane instead of the old "Not Available" text).
//Talks to controllers/aiAgentController.php -> classes/aiAgent.php, which caches answers per building/suite
//and rate-limits real Gemini calls per user/building/suite (see classes/aiAgentConfig.php).

//contextType is "AOS" (suite-level, the AOS/Floorplan infobox) or a building-level context (no suite) -
//"Office Market", "Hotel" or "Multifamily", from toggleBuildingAIAgentPanel() in main.js. It picks which
//question set/context the backend uses - passed through to every call below and on to
//controllers/aiAgentController.php. window.aiAgentQuestionsByType is keyed by these same strings.
function buildAIAgentPanel(uid, idtbuilding, idtsuite, contextType)
{
	var html = "<div class='ai-agent-panel'>";
	html += buildAIAgentDefaultQuestionPills(uid, idtbuilding, idtsuite, contextType);
	html += "<div class='ai-agent-question-row'>";
	html += "<input type='text' class='ai-agent-question-input' id='aiAgentQuestion-" + uid + "' placeholder='Ask about this building…' onkeydown='if(event.key===\"Enter\"){askAIAgentQuestion(" + uid + ", " + idtbuilding + ", " + idtsuite + ", \"" + contextType + "\");}'>";
	html += "<button type='button' class='btn btn-sm btn-primary ai-agent-ask-btn' onclick='askAIAgentQuestion(" + uid + ", " + idtbuilding + ", " + idtsuite + ", \"" + contextType + "\");'>Ask</button>";
	html += "</div>";
	html += "<div class='ai-agent-answer' id='aiAgentAnswer-" + uid + "'></div>";
	html += "</div>";
	return html;
}

//window.aiAgentQuestionsByType comes from tai_agent_questions via classes/aiAgent.php::getDefaultQuestionsByType()
//and index.php, keyed by "Office Market" / "Multifamily" / "Hotel" / "AOS". Each entry is
//{id: idtai_agent_questions, question: text}. Pills reference the array index (not the raw text) in the
//onclick so question text with quotes/apostrophes can't break the generated HTML; the row id is sent back
//with the ask so classes/aiAgent.php bumps that row's ask_count.
function buildAIAgentDefaultQuestionPills(uid, idtbuilding, idtsuite, contextType)
{
	var questions = window.aiAgentQuestionsByType ? window.aiAgentQuestionsByType[contextType] : null;
	if(!questions || questions.length == 0)
		return "";
	var html = "<div class='ai-agent-pills-row'>";
	$.each(questions, function (index, q) {
		html += "<button type='button' class='ai-agent-pill' onclick='askAIAgentPredefinedQuestion(" + uid + ", " + idtbuilding + ", " + idtsuite + ", " + index + ", \"" + contextType + "\");'>" + aiAgentEscapeHtml(q.question) + "</button>";
	});
	html += "</div>";
	return html;
}

function askAIAgentPredefinedQuestion(uid, idtbuilding, idtsuite, index, contextType)
{
	var questions = window.aiAgentQuestionsByType ? window.aiAgentQuestionsByType[contextType] : null;
	if(!questions || typeof questions[index] == "undefined")
		return;
	var questionEl = document.getElementById("aiAgentQuestion-" + uid);
	if(questionEl)
		questionEl.value = questions[index].question;
	askAIAgentQuestion(uid, idtbuilding, idtsuite, contextType, questions[index].id);
}

//Set window.aiAgentDebug = true in the console to log every controller call/response here.
window.aiAgentDebug = false;

//questionId is the tai_agent_questions row id when a pill was clicked (see askAIAgentPredefinedQuestion),
//or omitted/0 for a free-typed question - only a non-zero id bumps ask_count on the backend.
function askAIAgentQuestion(uid, idtbuilding, idtsuite, contextType, questionId)
{
	var questionEl = document.getElementById("aiAgentQuestion-" + uid);
	var answerEl = document.getElementById("aiAgentAnswer-" + uid);
	if(!questionEl || !answerEl)
		return;

	var question = questionEl.value.trim();
	if(question == "")
		return;

	answerEl.innerHTML = "<div class='ai-agent-loading'>Thinking...</div>";

	var requestData = {
		param: "askQuestion",
		idtuser: window.loggedInUserId,
		idtcity: window.lastCityLoaded,
		idtmarket: window.lastMarketLoaded,
		idtbuilding: idtbuilding,
		idtsuite: idtsuite,
		question: question,
		contextType: contextType || "AOS",
		questionId: questionId || 0
	};
	if(window.aiAgentDebug)
		console.log("[aiAgent] request", requestData);

	$.ajax({
		method: "POST",
		url: "controllers/aiAgentController.php",
		data: requestData
	}).done(function (rawData) {
		if(window.aiAgentDebug)
			console.log("[aiAgent] raw response", rawData);
		var data;
		try
		{
			data = $.parseJSON(rawData);
		}
		catch(parseErr)
		{
			console.error("[aiAgent] couldn't parse controller response", parseErr, rawData);
			answerEl.innerHTML = "<div class='ai-agent-error-message'>Something went wrong. Please try again.</div>";
			return;
		}
		renderAIAgentAnswer(answerEl, data);
	}).fail(function (jqXHR, textStatus) {
		if(window.aiAgentDebug)
			console.log("[aiAgent] request failed", textStatus, jqXHR);
		answerEl.innerHTML = "<div class='ai-agent-error-message'>Something went wrong. Please try again.</div>";
	});
}

function renderAIAgentAnswer(answerEl, data)
{
	if(data.status == "success")
	{
		var html = "<div class='ai-agent-answer-text'>" + aiAgentEscapeHtml(data.answer).replace(/\n/g, "<br>") + "</div>";
		if(data.cached)
			html += "<div class='ai-agent-cached-note'>(cached answer)</div>";
		if(data.sources && data.sources.length > 0)
		{
			html += "<div class='ai-agent-sources'><b>Sources:</b><ul>";
			$.each(data.sources, function (i, src) {
				html += "<li><a href='" + aiAgentEscapeHtml(src.uri) + "' target='_blank' rel='noopener'>" + aiAgentEscapeHtml(src.title || src.uri) + "</a></li>";
			});
			html += "</ul></div>";
		}
		answerEl.innerHTML = html;
	}
	else if(data.status == "limit_exceeded")
	{
		answerEl.innerHTML = "<div class='ai-agent-limit-message'>" + aiAgentEscapeHtml(data.message) + "</div>";
	}
	else
	{
		answerEl.innerHTML = "<div class='ai-agent-error-message'>" + aiAgentEscapeHtml(data.message || "Something went wrong. Please try again.") + "</div>";
	}
}

function aiAgentEscapeHtml(text)
{
	var div = document.createElement("div");
	div.innerText = text == null ? "" : text;
	return div.innerHTML;
}
