//Pulls the Gemini (Generative Language API) spend amount from Google Cloud billing and console.log()s it.
//
//Google does not expose "current spend" on the Gemini/AI Studio API itself - the billed amount lives in
//Cloud Billing. The one programmatic source is the BigQuery billing export
//(https://cloud.google.com/billing/docs/how-to/export-data-bigquery). Enable "Standard usage cost" export
//once, then this function queries that table via the BigQuery REST API.
//
//Needs:
//  - accessToken : OAuth 2.0 token with scope https://www.googleapis.com/auth/bigquery (or .../cloud-platform).
//                  Get one from gcloud:  gcloud auth print-access-token
//  - projectId   : the project that owns the billing export dataset
//  - dataset     : billing export dataset name (e.g. "billing_export")
//  - table       : billing export table (e.g. "gcp_billing_export_v1_XXXXXX_XXXXXX_XXXXXX")
//
//Usage:
//  getGeminiSpend({
//    accessToken: "ya29....",
//    projectId:   "my-project",
//    dataset:     "billing_export",
//    table:       "gcp_billing_export_v1_0123AB_4567CD_89EF01",
//    sinceDays:   30            // optional, default 30
//  });

function getGeminiSpend(opts)
{
	opts = opts || {};
	var accessToken = opts.accessToken;
	var projectId   = opts.projectId;
	var dataset     = opts.dataset;
	var table       = opts.table;
	var sinceDays   = opts.sinceDays || 30;

	if(!accessToken || !projectId || !dataset || !table)
	{
		console.error("[geminiSpend] accessToken, projectId, dataset and table are all required");
		return;
	}

	//service.description for the Gemini API in billing data. "Generative Language API" is the current name;
	//older rows may read "Gemini API" - match either.
	var sql =
		"SELECT" +
		"  service.description AS service," +
		"  currency," +
		"  ROUND(SUM(cost), 2) AS gross_cost," +
		"  ROUND(SUM(cost) + SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)), 2) AS net_cost" +
		" FROM `" + projectId + "." + dataset + "." + table + "`" +
		" WHERE (service.description = 'Generative Language API' OR service.description = 'Gemini API')" +
		"   AND usage_start_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL " + sinceDays + " DAY)" +
		" GROUP BY service, currency";

	var url = "https://bigquery.googleapis.com/bigquery/v2/projects/" + encodeURIComponent(projectId) + "/queries";

	fetch(url, {
		method: "POST",
		headers: {
			"Authorization": "Bearer " + accessToken,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ query: sql, useLegacySql: false })
	})
	.then(function (res) { return res.json(); })
	.then(function (data) {
		if(data.error)
		{
			console.error("[geminiSpend] BigQuery error", data.error);
			return;
		}

		var fields = (data.schema && data.schema.fields) ? data.schema.fields.map(function (f) { return f.name; }) : [];
		var rows = (data.rows || []).map(function (r) {
			var obj = {};
			r.f.forEach(function (cell, i) { obj[fields[i] || i] = cell.v; });
			return obj;
		});

		var total = rows.reduce(function (sum, r) { return sum + parseFloat(r.net_cost || r.gross_cost || 0); }, 0);

		console.log("[geminiSpend] last " + sinceDays + " days");
		console.log("[geminiSpend] rows", rows);
		console.log("[geminiSpend] total net spend", Math.round(total * 100) / 100, rows.length ? rows[0].currency : "");
	})
	.catch(function (err) {
		console.error("[geminiSpend] request failed", err);
	});
}
