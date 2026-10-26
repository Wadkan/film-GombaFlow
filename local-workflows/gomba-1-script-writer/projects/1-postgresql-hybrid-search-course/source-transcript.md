# Forrásvideó átirata

- Forrás: https://www.youtube.com/watch?v=kT7nXO32L-Q
- Felismert nyelv: en

## Átirat

[00:00:00–00:00:02] In this video, you'll learn about adding search to apps
[00:00:02–00:00:05] by building a Wikipedia search app
[00:00:05–00:00:10] with PostgreSQL, PGTechSearch, and TigerData.
[00:00:10–00:00:13] Watch what happens when I search for animals
[00:00:13–00:00:15] that make their own light.
[00:00:15–00:00:17] That describes an idea,
[00:00:17–00:00:20] but it might not use the words in the article I need.
[00:00:20–00:00:23] Here are the keyword results.
[00:00:23–00:00:25] Now let's switch to semantic search,
[00:00:25–00:00:27] which compares the meaning of the query
[00:00:27–00:00:28] with the article embeddings.
[00:00:28–00:00:33] And here's hybrid search, which combines both lists.
[00:00:33–00:00:36] Our articles, keyword index, and vectors
[00:00:36–00:00:39] all live in one PostgreSQL database.
[00:00:39–00:00:42] We're using an extension called PGTechSearch
[00:00:42–00:00:44] for BM25 ranking,
[00:00:44–00:00:48] and PGVector with PGVectorScale for semantic search.
[00:00:48–00:00:49] I'm Bo Karns, and in this course,
[00:00:49–00:00:52] we'll build this application together.
[00:00:52–00:00:55] We'll load real Wikipedia articles,
[00:00:55–00:00:57] inspect the SQL,
[00:00:57–00:01:00] and connect everything to a small web interface.
[00:01:00–00:01:03] You'll learn what each search method does well,
[00:01:03–00:01:05] where it struggles, and how to decide
[00:01:05–00:01:09] whether combining them actually improves your results.
[00:01:09–00:01:12] Our project is called WikiSearch.
[00:01:12–00:01:14] Keyword search will cover about
[00:01:14–00:01:18] 242,000 simple English Wikipedia articles.
[00:01:18–00:01:21] To keep the embedding job manageable,
[00:01:21–00:01:24] semantic search will cover approximately
[00:01:24–00:01:27] 25,000 of those articles.
[00:01:27–00:01:28] The interface reports both counts
[00:01:28–00:01:32] because that difference matters when we compare results.
[00:01:32–00:01:36] You'll need basic SQL, enough Python to run a script,
[00:01:36–00:01:39] and PostgreSQL with the extensions we're using.
[00:01:39–00:01:41] I'll use TigerCloud,
[00:01:41–00:01:44] and the repository also explains the local option.
[00:01:44–00:01:46] All the code is included.
[00:01:46–00:01:48] You can pause at a chapter,
[00:01:48–00:01:51] run its SQL file, and inspect what changed.
[00:01:51–00:01:54] We'll spend our time understanding the decisions
[00:01:54–00:01:57] that make the application work.
[00:01:57–00:01:59] Our project is called WikiSearch.
[00:01:59–00:02:01] Keyword search will cover about
[00:02:01–00:02:05] 242,000 simple English Wikipedia articles.
[00:02:05–00:02:07] To keep the embedding job manageable,
[00:02:07–00:02:09] semantic search will cover approximately
[00:02:09–00:02:11] 25,000 of those articles.
[00:02:11–00:02:13] The interface reports both counts
[00:02:13–00:02:15] because that difference matters
[00:02:15–00:02:17] when we compare results.
[00:02:17–00:02:20] You can use the code link in the description to follow along.
[00:02:20–00:02:22] You'll need basic SQL, enough Python to run a script,
[00:02:22–00:02:26] and PostgreSQL with the extensions we're using.
[00:02:26–00:02:27] I'll use TigerCloud,
[00:02:27–00:02:32] and the repository also explains the local option.
[00:02:32–00:02:33] All the code is included.
[00:02:33–00:02:34] So you can pause at a chapter,
[00:02:34–00:02:37] run its SQL file, and inspect what changed.
[00:02:37–00:02:39] We'll spend our time understanding the decisions
[00:02:39–00:02:42] that make our application work.
[00:02:42–00:02:45] Okay, here's our URL, then slash health.
[00:02:45–00:02:49] And you can see it's gonna give us some information here.
[00:02:49–00:02:54] We're targeting PG text search version 1.5.1.
[00:02:54–00:02:57] We'll verify the installed version before starting,
[00:02:57–00:03:00] so the Boolean and phrase examples later in the course
[00:03:00–00:03:03] match the database you're actually running.
[00:03:03–00:03:05] Now this course was made possible
[00:03:05–00:03:07] with a grant from TigerData,
[00:03:07–00:03:12] which is the company behind TimeScaleDB and PG text search.
[00:03:12–00:03:15] So thanks to TigerData for supporting FrecoCamp.
[00:03:15–00:03:19] And they're offering $1,000 in TigerCloud credit
[00:03:19–00:03:23] for 30 days through the link in the description.
[00:03:23–00:03:25] We'll use TigerCloud for the walkthrough
[00:03:25–00:03:28] because the database extensions are available there,
[00:03:28–00:03:31] and the service handles the server configuration.
[00:03:31–00:03:34] We'll still enable the extensions in our own database,
[00:03:34–00:03:37] which we'll do together shortly.
[00:03:37–00:03:40] But all this can be done locally as well,
[00:03:40–00:03:43] and not through TigerCloud.
[00:03:43–00:03:45] PG text search is open source
[00:03:45–00:03:47] under the PostgreSQL license.
[00:03:47–00:03:49] So you can also run it on your own
[00:03:49–00:03:52] compatible PostgreSQL server.
[00:03:52–00:03:53] The search code you're learning
[00:03:53–00:03:58] is ordinary SQL plus extension operators.
[00:03:58–00:04:00] You can open up the sign up link in the description,
[00:04:00–00:04:03] and then later we'll create the service,
[00:04:03–00:04:06] check the version, and connect our project.
[00:04:06–00:04:09] Let's start with the problem we're solving.
[00:04:09–00:04:11] Imagine an application that already stores
[00:04:11–00:04:13] its articles in Postgres.
[00:04:13–00:04:17] At first, the search box might use a simple text filter.
[00:04:17–00:04:20] Eventually, users want better ranking,
[00:04:20–00:04:23] and the team adds a separate search service.
[00:04:23–00:04:25] An article changes in Postgres.
[00:04:25–00:04:29] A job or change stream copies it to the search system.
[00:04:29–00:04:31] The application then reads search results
[00:04:31–00:04:34] from that second system.
[00:04:34–00:04:35] Now we have to decide what happens
[00:04:35–00:04:39] when the copy is delayed, when an event fails,
[00:04:39–00:04:42] or when we rebuild the search index.
[00:04:42–00:04:43] A user might save an edit
[00:04:43–00:04:46] and still see the old version in search.
[00:04:46–00:04:49] For this project, we'll keep the search indexes
[00:04:49–00:04:51] alongside the articles.
[00:04:51–00:04:54] That gives us one transaction boundary for the data
[00:04:54–00:04:57] and its index, and lets us combine search
[00:04:57–00:05:01] with the relational queries we already understand.
[00:05:01–00:05:05] There are two different jobs inside a search request.
[00:05:05–00:05:08] Matching decides which documents are eligible.
[00:05:08–00:05:13] Ranking decides which eligible documents should come first.
[00:05:13–00:05:16] Suppose I do a search for volcano eruption
[00:05:16–00:05:19] ash cloud aviation.
[00:05:19–00:05:23] An all terms filter asks whether every surviving query term
[00:05:23–00:05:25] appears in the document.
[00:05:25–00:05:28] A relevance ranking asks how useful
[00:05:28–00:05:30] the document looks for this query.
[00:05:30–00:05:34] A page about disrupting flights could be useful
[00:05:34–00:05:37] even if it never uses the word aviation.
[00:05:37–00:05:39] Postgres UL's built in text search
[00:05:39–00:05:43] supports boolean queries and phrases.
[00:05:43–00:05:48] We'll use it as our baseline and see what BM25 adds.
[00:05:48–00:05:53] PG text search adds corpus aware BM25 scoring
[00:05:53–00:05:57] and an index design for efficient ranked retrieval.
[00:05:57–00:05:59] Later, we'll combine that ranking
[00:05:59–00:06:04] with explicit matching rules when our application needs them.
[00:06:05–00:06:08] The built in TS rank function
[00:06:08–00:06:11] considers matching terms within a document.
[00:06:11–00:06:14] It doesn't have the collection wide document frequencies
[00:06:14–00:06:16] that BM25 uses.
[00:06:16–00:06:19] Those statistics help distinguish a term
[00:06:19–00:06:21] that appears almost everywhere
[00:06:21–00:06:25] from one that identifies a much narrower topic.
[00:06:25–00:06:29] Postgres UL offers length normalization options
[00:06:29–00:06:32] and its ranking function already handles repeated terms
[00:06:32–00:06:34] with diminishing effects.
[00:06:34–00:06:38] BM25 gives us a tunable model
[00:06:38–00:06:42] that combines term frequency with average document length
[00:06:42–00:06:45] and collection wide document frequencies.
[00:06:45–00:06:48] That combined model is what we're adding here.
[00:06:48–00:06:50] A Gint index can find matching documents
[00:06:50–00:06:53] but it doesn't provide the BM25 score ordering
[00:06:53–00:06:55] we're about to use.
[00:06:55–00:06:58] Ranking mini matches may require calculating scores
[00:06:58–00:07:02] and sorting them before returning 10 rows.
[00:07:02–00:07:04] We'll inspect our actual plan
[00:07:04–00:07:07] instead of assigning a universal runtime
[00:07:07–00:07:09] to a native search.
[00:07:09–00:07:12] The number of matches, document sizes,
[00:07:12–00:07:17] memory and hardware all affect that measurement.
[00:07:17–00:07:19] BM25 is a ranking function.
[00:07:19–00:07:23] First, a query term is more information
[00:07:23–00:07:26] when it appears in fewer documents.
[00:07:26–00:07:29] Second, seeing a term repeatedly helps
[00:07:29–00:07:32] but each additional mention should contribute less.
[00:07:32–00:07:34] Third, document length matters
[00:07:34–00:07:38] because a very long article has more opportunities
[00:07:38–00:07:41] to mention almost any subject.
[00:07:41–00:07:42] Those ideas work together.
[00:07:42–00:07:47] BM25 isn't simply counting how many query words it finds.
[00:07:47–00:07:49] It uses collection statistics
[00:07:49–00:07:53] and a controlled contribution from each matching term.
[00:07:53–00:07:56] You'll encounter BM25 in search systems
[00:07:56–00:07:59] such as Lucene and Elasticsearch.
[00:07:59–00:08:01] Sharing a ranking family
[00:08:01–00:08:04] doesn't make two search products identical though.
[00:08:04–00:08:07] Tokenization, features, configuration
[00:08:07–00:08:10] and implementation still matter.
[00:08:10–00:08:14] In PGTechSearch, we choose a TechSearch configuration
[00:08:14–00:08:17] and build a BM25 index.
[00:08:17–00:08:21] The index supplies the statistics needed for scoring.
[00:08:21–00:08:24] Let's unpack the three ideas with examples
[00:08:24–00:08:27] then we'll run them against real articles.
[00:08:27–00:08:30] Imagine a collection of 1,000 documents,
[00:08:30–00:08:34] 900 mentioned database, but only 10 mentioned pooling.
[00:08:34–00:08:36] For the query database pooling,
[00:08:36–00:08:40] pooling narrows down the collection much more.
[00:08:40–00:08:42] These counts are illustrative
[00:08:42–00:08:45] so we can see the idea clearly.
[00:08:45–00:08:49] Inverse document frequency or IDF captures that difference.
[00:08:49–00:08:51] A term that appears in fewer documents
[00:08:51–00:08:55] contributes more evidence of relevance.
[00:08:55–00:08:57] BM25 combines that evidence
[00:08:57–00:09:00] with term frequency and document length.
[00:09:00–00:09:03] Rarity helps, but it isn't the whole score.
[00:09:03–00:09:05] The collection matters too.
[00:09:05–00:09:09] In this subset, pooling appears in eight
[00:09:09–00:09:12] of 20 specialist documents.
[00:09:12–00:09:16] It was rare in the full collection, but here it's common.
[00:09:16–00:09:18] Partial indexes and partitions
[00:09:18–00:09:21] can have different statistics.
[00:09:21–00:09:25] A BM25 score belongs to its query and index
[00:09:25–00:09:29] so compare rankings within that context.
[00:09:29–00:09:33] Now imagine two articles that both discuss pooling.
[00:09:33–00:09:35] One mentions it once.
[00:09:35–00:09:38] Another mentions it 10 times.
[00:09:38–00:09:41] Repetition can indicate that the topic is central
[00:09:41–00:09:43] so it makes sense for it to help.
[00:09:43–00:09:46] But the 50th mention shouldn't have the same effect
[00:09:46–00:09:49] as the first.
[00:09:49–00:09:52] BM25's term frequency component levels off.
[00:09:52–00:09:57] The parameter called K1 controls that saturation.
[00:09:57–00:10:01] The default in PG Tech search is 1.2.
[00:10:01–00:10:03] Think of this as controlling how quickly
[00:10:03–00:10:07] additional mentions stop making much difference.
[00:10:07–00:10:09] A larger value generally allows frequency
[00:10:09–00:10:13] to keep contributing over a wider range.
[00:10:13–00:10:15] We also need to account for document length.
[00:10:15–00:10:20] That's the job of B, whose default is 0.75.
[00:10:20–00:10:23] It adjusts the frequency contribution
[00:10:23–00:10:25] using the document's length
[00:10:25–00:10:27] relative to the collection's average.
[00:10:27–00:10:30] We'll keep the defaults until we have evidence
[00:10:30–00:10:33] that changing them helps our queries.
[00:10:33–00:10:36] With B at 0, that length adjustment is disabled.
[00:10:36–00:10:39] Increasing B strengthens it.
[00:10:39–00:10:42] This doesn't mean short documents always win.
[00:10:42–00:10:45] Matching terms with their frequencies still matter
[00:10:45–00:10:50] and a long document can absolutely be the best result.
[00:10:50–00:10:52] Now how do we avoid scoring everything
[00:10:52–00:10:54] just to show 10 articles?
[00:10:54–00:10:57] PG Tech search uses an inverted index
[00:10:57–00:11:01] which connects terms with the documents containing them.
[00:11:01–00:11:06] Its block max wand optimization can skip posting blocks
[00:11:07–00:11:10] that cannot improve the current top results.
[00:11:10–00:11:12] That's why the combination of an ordered score
[00:11:12–00:11:14] and a limit is important.
[00:11:14–00:11:17] We're asking the index for a small set
[00:11:17–00:11:18] of strong candidates.
[00:11:18–00:11:22] The extension stores its index in PostgreSQL pages
[00:11:22–00:11:25] and participates in PostgreSQL storage
[00:11:25–00:11:27] and recovery machinery.
[00:11:27–00:11:31] Internally, it manages new postings and disk segments.
[00:11:31–00:11:33] We do not need to check that our query plan
[00:11:33–00:11:36] uses the intended access path.
[00:11:36–00:11:39] So let's create the database.
[00:11:39–00:11:43] So go to this URL, we have the URL in the description
[00:11:43–00:11:45] and then you can sign up
[00:11:45–00:11:49] and this will give you $1,000 in cloud credits
[00:11:49–00:11:51] for 30 days.
[00:11:51–00:11:54] Now we can go through and choose our service
[00:11:54–00:11:56] after getting logged in.
[00:11:56–00:11:58] So there's always a free version
[00:11:58–00:12:01] but since we have a bunch of credits
[00:12:01–00:12:02] I'm gonna choose a bigger one.
[00:12:02–00:12:05] I'm gonna just choose the one GPU version.
[00:12:05–00:12:07] We're getting four gigabytes of RAM
[00:12:07–00:12:10] and then we can choose our region.
[00:12:10–00:12:12] Just usually just wanna choose the region
[00:12:12–00:12:17] that's closest to you and then click continue.
[00:12:17–00:12:18] Now we're gonna just choose
[00:12:18–00:12:20] that we're using our development environment
[00:12:20–00:12:24] and continue and then you can name your service
[00:12:24–00:12:27] or just use the default name.
[00:12:27–00:12:28] So what you're gonna wanna do
[00:12:28–00:12:32] is copy the connection string
[00:12:32–00:12:34] and then you wanna create a copy
[00:12:34–00:12:36] of the .EMV.example file
[00:12:36–00:12:40] and then add your connection string
[00:12:40–00:12:42] right in the database URL
[00:12:43–00:12:45] and then you can have a random token
[00:12:45–00:12:48] and the model device is CPU.
[00:12:48–00:12:52] And you remember this should be called .EMV.
[00:12:52–00:12:54] Now make sure to open up the code file,
[00:12:54–00:12:58] the code from the repository link
[00:12:58–00:13:01] and the read me it's gonna show everything
[00:13:01–00:13:03] we need you to do to get this set up.
[00:13:03–00:13:05] There's gonna be a quick start commands
[00:13:05–00:13:09] and we'll use the console to establish the database
[00:13:09–00:13:12] then run the Python code locally.
[00:13:12–00:13:16] Now what I'm gonna do is go back to the dashboard here.
[00:13:16–00:13:18] I'm gonna go into my project
[00:13:18–00:13:22] and then we have our SQL editor at the bottom.
[00:13:22–00:13:25] So this is where we can kind of test out the database.
[00:13:25–00:13:30] I'm just gonna do select current date and then run.
[00:13:30–00:13:31] Okay, we got the date here.
[00:13:31–00:13:34] So this is all set up correctly.
[00:13:34–00:13:37] Now I'm just gonna put in some other code here
[00:13:37–00:13:40] and this will just check the versions
[00:13:40–00:13:42] of everything we have.
[00:13:42–00:13:45] Okay, now I've ran this code in the SQL editor
[00:13:45–00:13:50] and this inspects available PG text search versions.
[00:13:50–00:13:55] We're targeting 1.5.1, which we see as set as true.
[00:13:56–00:14:00] And this should be available on Tiger Cloud.
[00:14:00–00:14:03] Now we can keep running commands in the SQL editor
[00:14:03–00:14:05] but there's also an easier method.
[00:14:05–00:14:06] Let me show you.
[00:14:06–00:14:10] Basically, we just wanna follow the quick start guide here.
[00:14:10–00:14:12] So first you wanna run all these commands
[00:14:12–00:14:15] in your terminal to create a virtual environment
[00:14:15–00:14:19] and then install the requirements.txt.
[00:14:19–00:14:22] And maybe you've already done this, create your .emv file
[00:14:22–00:14:25] and then you're basically gonna run
[00:14:25–00:14:27] every one of these commands here
[00:14:27–00:14:30] and you can run them right in your terminal.
[00:14:30–00:14:33] Now I've already run them.
[00:14:33–00:14:34] It takes a little bit,
[00:14:34–00:14:37] some of them can take a little while to run
[00:14:37–00:14:38] but let me just go over them
[00:14:38–00:14:40] so you can understand how this works.
[00:14:40–00:14:43] These are the commands we're gonna set up your database.
[00:14:43–00:14:46] So first it's the extensions file.
[00:14:46–00:14:50] This enables PG text search and vector scale.
[00:14:50–00:14:54] The cascade option also installs the vector dependency
[00:14:54–00:14:56] if it isn't already enabled.
[00:14:56–00:14:59] The version query should show PG text search,
[00:14:59–00:15:02] vector and vector scale.
[00:15:02–00:15:04] The script also checks that PG text search
[00:15:04–00:15:07] is new enough for this course.
[00:15:07–00:15:10] If an existing service is on an older release,
[00:15:10–00:15:13] follow Tiger's service update instructions.
[00:15:13–00:15:15] You may need the service maintenance update
[00:15:15–00:15:18] before the newer extension version becomes available.
[00:15:18–00:15:19] Then update the extension in the database
[00:15:19–00:15:22] as the readme describes.
[00:15:22–00:15:24] Don't keep going past the failed version check,
[00:15:24–00:15:27] thinking that now is much easier than diagnosing
[00:15:27–00:15:31] a phrase query example against an older installation.
[00:15:31–00:15:33] Now we've already discussed these
[00:15:33–00:15:35] about creating a Python virtual environment,
[00:15:35–00:15:38] activating it, installing the requirements
[00:15:38–00:15:41] but just so you know, the embedding libraries
[00:15:41–00:15:43] can take a while to install.
[00:15:43–00:15:46] For this project, we're using simple English Wikipedia
[00:15:46–00:15:50] from Wikimedia's data set on Huggingface.
[00:15:50–00:15:55] The snapshot is named 20231101.simple.
[00:15:55–00:16:00] It contains 241,787 articles.
[00:16:01–00:16:05] The downloaded parquet file is about 157 megabytes.
[00:16:05–00:16:07] That is the compressed download size,
[00:16:07–00:16:10] not the final size of our database and indexes.
[00:16:10–00:16:15] Each record includes an ID, URL, title, and article text.
[00:16:15–00:16:19] So if I do a search here, I can click one of these links
[00:16:19–00:16:23] and it's gonna open on simple English Wikipedia.
[00:16:23–00:16:27] And the data set card lists
[00:16:27–00:16:30] creative commons attribution share like 3.0
[00:16:30–00:16:34] and the GNU free documentation license.
[00:16:34–00:16:36] Our readme and interface include attribution
[00:16:36–00:16:38] and license links and identify that we shorten
[00:16:38–00:16:41] and highlight excerpts.
[00:16:41–00:16:44] So now I'm gonna open this load.py,
[00:16:44–00:16:48] which we are gonna be running soon to load the database.
[00:16:48–00:16:52] The loader pins a specific data set revision
[00:16:52–00:16:56] and checks the downloaded files checksum.
[00:16:56–00:16:58] That helps keep a future run of this course
[00:16:58–00:16:59] tied to the same source material
[00:16:59–00:17:02] instead of whatever a moving branch contains.
[00:17:02–00:17:05] We're also going to create a schema
[00:17:05–00:17:09] with this schema.sql file.
[00:17:09–00:17:12] The table has five columns to start.
[00:17:12–00:17:15] ID, URL, title, body, and word count.
[00:17:15–00:17:18] The Wikipedia ID becomes our primary key.
[00:17:18–00:17:20] The body stores article text
[00:17:20–00:17:24] and word count gives us a simple field for filters
[00:17:24–00:17:27] and choosing an embedding subset.
[00:17:27–00:17:28] So back on load.py,
[00:17:28–00:17:30] we can see it downloads the parquet file
[00:17:30–00:17:32] through Huggingface, reads it in batches
[00:17:32–00:17:36] and sends rows to PostgreSQL with copy.
[00:17:36–00:17:39] We copy into a temporary staging table,
[00:17:39–00:17:42] then insert into articles.
[00:17:42–00:17:44] If an ID is already present,
[00:17:44–00:17:46] the loader leaves that row alone.
[00:17:46–00:17:48] That makes rerunning the initial load safe
[00:17:48–00:17:51] without accidentally replacing work we've added later.
[00:17:51–00:17:54] Work count here is a white space based estimate.
[00:17:54–00:17:56] It isn't the same as the token count
[00:17:56–00:17:58] used by the text search configuration
[00:17:58–00:17:59] or the embedding tokenizer.
[00:17:59–00:18:01] It's useful for a course filter,
[00:18:01–00:18:04] but we shouldn't confuse those different measurements.
[00:18:04–00:18:07] So basically, we're not gonna run this command
[00:18:07–00:18:10] in your terminal, load.py.
[00:18:10–00:18:12] The first run downloads the dataset,
[00:18:12–00:18:15] checks it, and copies the records.
[00:18:15–00:18:17] Your time will depend on your network,
[00:18:17–00:18:20] database resources, and connection latency.
[00:18:20–00:18:22] The loader reports how many records it read,
[00:18:22–00:18:24] how many it inserted,
[00:18:24–00:18:27] and the total rows now in the table.
[00:18:27–00:18:28] If you rerun it,
[00:18:28–00:18:30] the inserted count should be zero
[00:18:30–00:18:32] for records already present.
[00:18:32–00:18:35] But we haven't created the search indexes yet.
[00:18:35–00:18:36] So for the initial import,
[00:18:36–00:18:40] loading the data first and billing the indexes afterward
[00:18:40–00:18:44] avoids maintaining those indexes one insertion at a time.
[00:18:44–00:18:46] Before we go into the next command,
[00:18:46–00:18:48] we can actually check.
[00:18:48–00:18:53] I'm gonna open this recording slash 17 counts file,
[00:18:53–00:18:56] and it'll give me the command to try running.
[00:18:56–00:18:58] So this time, I'm actually gonna show you
[00:18:58–00:19:01] running the other ones I had already run beforehand.
[00:19:01–00:19:04] So I'm just gonna run python db.py,
[00:19:04–00:19:07] and then I'm gonna pass in the SQL command.
[00:19:07–00:19:11] And then we can see how many articles there are.
[00:19:11–00:19:14] So on a fresh full load,
[00:19:14–00:19:19] we expect the dataset sets 241,787 rows.
[00:19:21–00:19:23] The source only count stays the same
[00:19:23–00:19:26] when we add original demo articles with negative IDs.
[00:19:27–00:19:30] Now I'm gonna run this as another test.
[00:19:30–00:19:34] So basically we're sorting by word count descending,
[00:19:34–00:19:37] and we're looking at the 10 largest articles.
[00:19:37–00:19:39] And then we're opening a few records,
[00:19:39–00:19:41] we open a few records
[00:19:41–00:19:43] and check that titles, bodies, and URLs
[00:19:43–00:19:45] landed in the expected columns.
[00:19:45–00:19:48] If the body's empty or the import only loads a sample,
[00:19:50–00:19:53] basically an index won't repair that.
[00:19:54–00:19:55] So this is just checking
[00:19:55–00:19:58] that things are being imported correctly.
[00:19:58–00:20:02] One thing interesting is that the load.py
[00:20:02–00:20:06] runs analyze after the import.
[00:20:06–00:20:09] That refreshes the planners table statistics.
[00:20:09–00:20:11] Those planner statistics are distinct
[00:20:11–00:20:15] from the corpus statistics inside the BM25 index.
[00:20:15–00:20:17] We'll also check whether our planned
[00:20:17–00:20:21] demonstration titles exist in the snapshot.
[00:20:21–00:20:22] The finished app should show actual results
[00:20:22–00:20:27] from this data, not a result invented for the introduction.
[00:20:27–00:20:30] So here's the text queries.txt.
[00:20:30–00:20:34] So we're going to do some test queries.
[00:20:34–00:20:37] So here's some different items
[00:20:37–00:20:39] that we're going to be testing.
[00:20:39–00:20:44] And we're going to use these same queries
[00:20:44–00:20:46] throughout the course.
[00:20:46–00:20:48] Apollo 13 asks for a specific subject
[00:20:48–00:20:50] while animals that make their own light
[00:20:50–00:20:53] described an idea without naming it.
[00:20:53–00:20:54] As we try each search method,
[00:20:54–00:20:57] we'll check whether the results answer the question
[00:20:57–00:20:59] and how long the search takes.
[00:20:59–00:21:02] For now, we're just choosing our test searches.
[00:21:02–00:21:05] So let's start with the volcano query.
[00:21:05–00:21:07] So we're going to run this SQL here
[00:21:07–00:21:10] and we're going to use this query,
[00:21:10–00:21:13] which is the volcano eruption ash cloud deviation.
[00:21:13–00:21:17] So this is before adding PG text search.
[00:21:17–00:21:18] We're going to try the search tools
[00:21:18–00:21:21] already built into PostgreSQL.
[00:21:21–00:21:25] This gives us a starting point to compare against.
[00:21:25–00:21:27] We'll search the article bodies first
[00:21:27–00:21:29] and add the titles later.
[00:21:29–00:21:32] So before we run that query,
[00:21:32–00:21:34] we're going to run this here.
[00:21:34–00:21:36] Basically, I just ran this command
[00:21:38–00:21:42] and it's going to create an index
[00:21:42–00:21:44] to help PostgreSQL find articles
[00:21:44–00:21:47] containing our search terms.
[00:21:47–00:21:48] An index is a structure,
[00:21:48–00:21:51] an extra structure the database maintains
[00:21:51–00:21:53] so it can find data more efficiently.
[00:21:53–00:21:57] The function TS vector
[00:21:57–00:21:59] versus two TS vector,
[00:21:59–00:22:02] the function two TS vector converts article text
[00:22:02–00:22:04] into a searchable representation.
[00:22:04–00:22:07] The English setting applies language rules
[00:22:07–00:22:09] such as reducing related word forms
[00:22:09–00:22:12] and ignoring common words like the.
[00:22:12–00:22:15] Using gen, the using gen here,
[00:22:15–00:22:17] it selects an index type
[00:22:17–00:22:19] that can look up those searchable terms.
[00:22:19–00:22:23] So we've run the command and it's created the index.
[00:22:23–00:22:27] So now we're going to finally run this query here.
[00:22:27–00:22:29] We'll read it in the order that matters
[00:22:29–00:22:32] for understanding the search.
[00:22:32–00:22:35] Plain two TS query,
[00:22:35–00:22:37] which is this section right here,
[00:22:37–00:22:41] it converts our search text into matching rules.
[00:22:41–00:22:43] The where line uses the double app operator
[00:22:43–00:22:45] to test whether an article matches.
[00:22:45–00:22:46] For the matching articles,
[00:22:46–00:22:49] TS rank calculates a relevant score.
[00:22:49–00:22:53] Order by rank descending puts higher scores first
[00:22:53–00:22:57] and limit 10 returns the first 10 results.
[00:22:57–00:22:59] Okay, so I'll run this right now.
[00:22:59–00:23:03] We can see that this search term return no matches.
[00:23:03–00:23:04] That's because it requires every search term
[00:23:04–00:23:07] to appear in the article body.
[00:23:07–00:23:09] Let's see how that matching rule works
[00:23:09–00:23:12] then loosen it to allow any of the terms.
[00:23:12–00:23:17] So now we're going to try this matching every word
[00:23:17–00:23:19] or any word.
[00:23:19–00:23:21] And when I run this command,
[00:23:21–00:23:25] we can see that ampersands mean every term is required.
[00:23:25–00:23:28] Our example sentence doesn't contain all of them,
[00:23:28–00:23:29] so the match is false.
[00:23:29–00:23:34] The vertical bars change the rule to accept any term.
[00:23:34–00:23:37] Basically, the sentence doesn't contain those terms.
[00:23:37–00:23:40] So it fails the all terms test.
[00:23:40–00:23:45] Now let's try that or rule on our articles.
[00:23:45–00:23:49] So notice the vertical lines between the search terms.
[00:23:49–00:23:52] That's gonna mean or.
[00:23:52–00:23:56] And we'll run these SQL commands right now.
[00:23:56–00:24:00] Okay, so now we're finally getting some results
[00:24:00–00:24:03] because we're doing the or here.
[00:24:04–00:24:07] So we have loosened the matching requirement.
[00:24:07–00:24:09] More articles can qualify
[00:24:09–00:24:11] and TS rank still decides their order.
[00:24:11–00:24:13] This demonstrates a choice we can make
[00:24:13–00:24:16] with post sequels built in search.
[00:24:16–00:24:18] So keep these two questions separate,
[00:24:18–00:24:20] which articles are allowed into the result
[00:24:20–00:24:22] and which of those articles appear first.
[00:24:22–00:24:25] And and or change the first question,
[00:24:25–00:24:28] the ranking function handles the second.
[00:24:28–00:24:30] We'll return to the original and query for next check.
[00:24:30–00:24:33] Later, BM25 will change how we search and rank
[00:24:33–00:24:35] so a different result list won't be due
[00:24:35–00:24:37] to scoring alone.
[00:24:38–00:24:41] So now we have some new SQL I'm gonna run here.
[00:24:41–00:24:45] And this is showing us the plan, the query plan.
[00:24:45–00:24:48] This is basically showing us SQL found the results.
[00:24:48–00:24:53] The explain here shows the database's execution plan.
[00:24:54–00:24:58] The steps it chose to answer a query.
[00:24:58–00:25:01] And adding analyze actually runs the query
[00:25:01–00:25:04] and reports measurements.
[00:25:04–00:25:09] Buffers here adds information about the data pages that accessed.
[00:25:09–00:25:12] You don't need to understand every line here.
[00:25:12–00:25:15] We'll just focus on the work that leads to our 10 results.
[00:25:16–00:25:19] So first we have the limit 10.
[00:25:19–00:25:23] That's where post SQL caps the output at 10 rows.
[00:25:23–00:25:26] So basically here in the plan,
[00:25:26–00:25:28] we can follow the indentation to the steps feeding it.
[00:25:28–00:25:31] We can look at for the steps that find matching articles
[00:25:31–00:25:34] and if present a sort step that orders them,
[00:25:34–00:25:37] the actual rows values describe what happened
[00:25:37–00:25:38] during this run.
[00:25:38–00:25:42] Post SQL may examine and rank many matching articles
[00:25:42–00:25:43] before returning 10.
[00:25:43–00:25:45] Limit 10 controls the output size.
[00:25:45–00:25:50] It doesn't automatically limit all the work to 10 articles.
[00:25:50–00:25:51] I'm gonna run another command.
[00:25:51–00:25:54] Basically I have this T here.
[00:25:55–00:25:57] T shows the output in the terminal
[00:25:57–00:25:59] and also writes it to a text file.
[00:25:59–00:26:03] We can also find the execution time near the bottom.
[00:26:03–00:26:06] The second run may be faster because,
[00:26:06–00:26:07] well, let's see if it's faster.
[00:26:07–00:26:10] Yeah, 0.323 milliseconds.
[00:26:11–00:26:13] I guess it's not faster, so nevermind.
[00:26:13–00:26:16] But sometimes it can be faster
[00:26:16–00:26:19] because post SQL already has some data memory.
[00:26:19–00:26:21] So now we're gonna try another search
[00:26:21–00:26:24] with the same method here.
[00:26:24–00:26:27] And we're doing jazz trumpet new Orleans.
[00:26:27–00:26:30] Now let's look at the first few titles here.
[00:26:30–00:26:33] This time we're actually getting some titles and ranks.
[00:26:33–00:26:35] So these two look useful.
[00:26:35–00:26:37] I'm just gonna save these two for later.
[00:26:37–00:26:41] We're basically gonna compare these later
[00:26:41–00:26:44] once we change the way we're doing search.
[00:26:46–00:26:50] And then I'm just gonna do the search for the Apollo 13.
[00:26:50–00:26:52] The SQL uses the digits one and three
[00:26:52–00:26:54] just like our saved query.
[00:26:55–00:26:56] Notice whether the results
[00:26:57–00:26:59] concern the mission we're looking for.
[00:26:59–00:27:03] So we're just comparing what it comes with here
[00:27:03–00:27:08] so we can basically compare it with BM 25.
[00:27:08–00:27:10] So later we're gonna be changing
[00:27:10–00:27:11] the way we're doing searching
[00:27:11–00:27:14] and we just wanna see how the BM 25
[00:27:14–00:27:16] relates to the other method.
[00:27:16–00:27:18] So far we've tested built in search
[00:27:18–00:27:20] and saved its query plan.
[00:27:20–00:27:23] Next we'll add BM 25 to the same article body column.
[00:27:23–00:27:26] And we're gonna see how that changes the search.
[00:27:26–00:27:30] And BM 25 uses the collection wide word statistics
[00:27:30–00:27:34] we discussed earlier, including how rare a term is.
[00:27:34–00:27:37] Using the same article text and search words
[00:27:37–00:27:39] makes it easier to see what changes.
[00:27:41–00:27:44] So now we'll create our BM 25 index.
[00:27:44–00:27:48] That's what this code is doing.
[00:27:48–00:27:53] Articles body BM 25 is the name we give the index.
[00:27:54–00:27:56] On articles identifies the table using BM 25
[00:27:56–00:27:58] selects the search method
[00:27:58–00:28:00] and body identifies the column to search.
[00:28:01–00:28:03] This text config English
[00:28:03–00:28:06] applies English text processing rules.
[00:28:06–00:28:09] This is where PG text search prepares
[00:28:09–00:28:12] the existing articles for BM 25 search.
[00:28:13–00:28:15] The two set commands at the top
[00:28:15–00:28:17] above the index control,
[00:28:17–00:28:19] they control resources for the session.
[00:28:19–00:28:21] One allows up to four maintenance workers.
[00:28:21–00:28:25] The other sets of maintenance memory budget of 256 megabytes.
[00:28:25–00:28:30] Now let's try some queries using the BM 25 query calls.
[00:28:31–00:28:33] The query looks similar to our first search
[00:28:33–00:28:35] but the score calculation has changed.
[00:28:35–00:28:40] The operator is less than at sign greater than.
[00:28:40–00:28:42] So it looks like here.
[00:28:42–00:28:44] It sits between the article body and the BM 25 query.
[00:28:44–00:28:46] You can think of that expression
[00:28:46–00:28:49] as score this article for the search.
[00:28:49–00:28:52] We use the expression and select to display the score
[00:28:52–00:28:55] and an order by to sort the results.
[00:28:55–00:29:00] We can see the most negative scores near the top
[00:29:00–00:29:04] then it's ascending the order by.
[00:29:04–00:29:07] So the negative numbers are expected.
[00:29:07–00:29:11] PG text search returns a negative of the BM 25 score.
[00:29:11–00:29:14] So a more negative number represents a stronger match.
[00:29:14–00:29:19] A score of negative 20 sorts before negative five.
[00:29:19–00:29:22] That's why the query uses ascending order
[00:29:22–00:29:25] or earlier TS rank query used ascending order.
[00:29:25–00:29:26] When switching between these methods
[00:29:26–00:29:28] you should check the sort direction.
[00:29:28–00:29:32] Now let's look inside the BM 25 query.
[00:29:33–00:29:38] We pass our search texts and the name articles body BM 25
[00:29:40–00:29:44] naming the index tells PG text search
[00:29:44–00:29:47] which indexes statistics to use.
[00:29:47–00:29:51] The score helps order articles for this particular search.
[00:29:51–00:29:55] It isn't a percentage, negative 20 doesn't mean
[00:29:55–00:29:57] an article is 20% relative.
[00:29:57–00:30:01] Judge the return articles as well as their order
[00:30:01–00:30:03] when we look at the results.
[00:30:03–00:30:05] So later our application will exclude keyword
[00:30:05–00:30:07] candidates with a zero score.
[00:30:07–00:30:10] Okay we have our BM 25 results.
[00:30:10–00:30:12] Now let's check whether PostgreSQL actually
[00:30:12–00:30:15] used the index we created.
[00:30:15–00:30:19] This check, this is a check on how the query runs
[00:30:19–00:30:22] not a new search feature.
[00:30:22–00:30:26] So I'm gonna run this command to explain the search.
[00:30:27–00:30:32] So we see in the plan articles body BM 25.
[00:30:32–00:30:36] So this is going to show the results
[00:30:36–00:30:39] being retrieved in score order.
[00:30:39–00:30:42] Now the plan and timing can differ
[00:30:42–00:30:45] with the data and service size.
[00:30:45–00:30:49] Okay so here is our native plan.txt
[00:30:49–00:30:52] we basically ran this plan.
[00:30:52–00:30:55] We create this plan and put it to a text file.
[00:30:55–00:30:59] So now we can compare it to the BM 25 plan.
[00:30:59–00:31:02] So let's compare these plans.
[00:31:02–00:31:07] So we see this bitmap index scan on articles body gen.
[00:31:07–00:31:09] Postgres is using our gen index
[00:31:09–00:31:12] to look for articles containing all five search terms.
[00:31:12–00:31:16] The ampersands mean and every term is required.
[00:31:16–00:31:19] In this data set no article body meets the condition.
[00:31:19–00:31:21] So we got zero results.
[00:31:21–00:31:26] We also have the sort key TS rank.
[00:31:26–00:31:28] This plan is a separate step for sorting matches by relevance
[00:31:28–00:31:30] but this particular search found nothing
[00:31:30–00:31:34] so there aren't any matching articles to rank or sort.
[00:31:34–00:31:36] Now we can see the index scan
[00:31:36–00:31:41] using articles body BM 25 and it's ordered by line.
[00:31:41–00:31:44] With PG text search the BM 25 index supports
[00:31:44–00:31:47] returning articles in relevance order.
[00:31:47–00:31:50] Notice that there's no separate sort step.
[00:31:50–00:31:52] This query doesn't require all five terms to appear
[00:31:52–00:31:55] and it returns 10 rank results.
[00:31:55–00:31:59] If we see the actual and then rows 10 here
[00:32:00–00:32:03] and then we have these execution times
[00:32:03–00:32:05] the native search finished in about a third
[00:32:05–00:32:08] of a millisecond while BM 25 took about nine milliseconds
[00:32:08–00:32:09] but they're doing different jobs.
[00:32:09–00:32:11] One found no article satisfying
[00:32:11–00:32:13] in all terms condition
[00:32:13–00:32:15] and the other returned 10 ranked articles.
[00:32:15–00:32:16] These timings don't tell us
[00:32:16–00:32:17] which approach is generally faster.
[00:32:17–00:32:20] What we verified is that our BM 25 query
[00:32:20–00:32:23] uses the intended index to produce ranked results.
[00:32:23–00:32:25] Next we'll turn our demonstration query
[00:32:25–00:32:28] into the query used by the app.
[00:32:28–00:32:31] So I'm opening in the SQL directory
[00:32:31–00:32:33] the search keyword.sql file.
[00:32:34–00:32:38] Our app needs to accept a search typed by a user.
[00:32:39–00:32:43] Open it's keyword query to see how we'll pass
[00:32:43–00:32:45] that text into SQL.
[00:32:45–00:32:46] This is a preview only
[00:32:46–00:32:50] we create its text search column and index next.
[00:32:50–00:32:55] The placeholder for queue holds the user's search text.
[00:32:55–00:32:59] The fixed named article search in BM 25
[00:32:59–00:33:03] identifies the index that supplies the scoring statistics.
[00:33:03–00:33:06] So now we'll go to one of the actual files
[00:33:06–00:33:10] in our application query.py.
[00:33:10–00:33:12] And we can see this kind of execute
[00:33:12–00:33:15] and with the SQL and the params
[00:33:15–00:33:17] we're basically looking at this Python call.
[00:33:17–00:33:22] It retrieves the SQL and a separate set of parameter values.
[00:33:22–00:33:25] A parameter is a value supplied when a query runs.
[00:33:25–00:33:28] Here that includes the user's search text.
[00:33:28–00:33:32] This Psycop G, which is our PostgreSQL driver
[00:33:32–00:33:35] sends the value safely to the database.
[00:33:35–00:33:36] We don't want a simple SQL
[00:33:36–00:33:40] by inserting the user's text into a string.
[00:33:40–00:33:43] So if we go back over to search keyword
[00:33:44–00:33:48] for example, a user might search for a name
[00:33:48–00:33:50] containing an apostrophe.
[00:33:50–00:33:53] That apostrophe should remain part of the search text.
[00:33:53–00:33:57] Parameter binding handles it as data.
[00:33:57–00:34:00] The fixed index name has a different job
[00:34:00–00:34:01] choosing the search index.
[00:34:01–00:34:04] Keep that name in the application's query file.
[00:34:04–00:34:06] The user supplies a search phrase
[00:34:06–00:34:09] and our code supplies the SQL structure.
[00:34:09–00:34:11] So far we've only searched article bodies
[00:34:11–00:34:16] but an article's title is useful search information as well.
[00:34:16–00:34:18] So let's include both.
[00:34:18–00:34:21] This command creates search text
[00:34:21–00:34:24] which combines the title and body.
[00:34:24–00:34:27] PostgreSQL keeps it updated automatically
[00:34:27–00:34:29] when either one changes.
[00:34:29–00:34:32] So I'm gonna run it in my terminal down here
[00:34:32–00:34:36] and we've basically altered the table.
[00:34:36–00:34:39] Now we'll build, so here's the next command.
[00:34:39–00:34:43] We're gonna build a B25 index on that combined text.
[00:34:43–00:34:48] This becomes the keyword search index for our app.
[00:34:48–00:34:50] So run this SQL.
[00:34:50–00:34:53] Our keyword search can now use words
[00:34:53–00:34:55] from both the title and body.
[00:34:55–00:34:59] Next let's help users understand why an article appeared
[00:34:59–00:35:02] by highlighting matching words in its previews.
[00:35:03–00:35:04] So we have the TS headline
[00:35:04–00:35:07] and we have the top results here.
[00:35:07–00:35:09] The title alone may not tell us whether a result is useful.
[00:35:09–00:35:13] Let's add a short preview with the matching words highlighted.
[00:35:13–00:35:18] In the keyword query, TS headline creates that preview.
[00:35:18–00:35:20] We chose the top articles first
[00:35:20–00:35:23] then prepare previews only for those results.
[00:35:23–00:35:25] There's no reason to prepare thousands of previews
[00:35:25–00:35:27] when we're showing 10.
[00:35:27–00:35:30] Now over in safety.py.
[00:35:30–00:35:34] The database marks which words to highlight.
[00:35:34–00:35:36] This Python function separates those words
[00:35:36–00:35:39] from the rest of the preview.
[00:35:39–00:35:42] That lets the page display article text safely
[00:35:42–00:35:44] even if the article contains something
[00:35:44–00:35:47] that looks like HTML code.
[00:35:47–00:35:50] Now open up the index.HTML here.
[00:35:50–00:35:53] Here the page inserts the words as text
[00:35:53–00:35:57] and adds highlighting around the marked pieces.
[00:35:59–00:36:00] That's the whole path.
[00:36:00–00:36:03] The database chooses the excerpt.
[00:36:03–00:36:05] Python identifies the highlights
[00:36:05–00:36:08] and the browser displays it.
[00:36:08–00:36:12] We'll see those previews when we open the finished app.
[00:36:13–00:36:15] And remember, you can always look at the code yourself
[00:36:15–00:36:17] using the link in the description.
[00:36:18–00:36:20] Now let's look at this SQL code.
[00:36:20–00:36:24] Recording, so sometimes ranking related articles
[00:36:24–00:36:25] isn't enough.
[00:36:25–00:36:27] A user might want articles that mention jazz
[00:36:27–00:36:29] but don't mention rock.
[00:36:29–00:36:31] This example adds that requirement.
[00:36:31–00:36:33] The ampersand means and
[00:36:33–00:36:36] the explanation mark means not.
[00:36:36–00:36:39] We'll run it and inspect the titles.
[00:36:39–00:36:44] Now this is an extra query option
[00:36:44–00:36:48] so it doesn't actually change our app search box.
[00:36:48–00:36:52] One thing we can also do is require phrasing
[00:36:52–00:36:57] or here we're asking for new Orleans together
[00:36:57–00:36:59] rather than letting those words appear anywhere
[00:36:59–00:37:01] in the article.
[00:37:01–00:37:04] Postgres SQL applies its language processing rule
[00:37:04–00:37:06] so this isn't a check for identical capitalization
[00:37:06–00:37:08] or punctuation.
[00:37:08–00:37:10] And you see this at here
[00:37:12–00:37:15] and there's a separate BM25 order by.
[00:37:15–00:37:18] These queries do two jobs.
[00:37:18–00:37:20] The matching condition decides which articles qualify.
[00:37:20–00:37:24] The BM25 puts those articles in relevance order.
[00:37:24–00:37:26] That combination can require extra work
[00:37:26–00:37:28] rather than one combined index scan.
[00:37:28–00:37:31] Our app will keep the simpler ranked search.
[00:37:31–00:37:34] So next let's help people find an article
[00:37:34–00:37:37] even when they don't know the right words to type.
[00:37:37–00:37:41] Imagine searching for animals that make their own light.
[00:37:41–00:37:43] You might want an article about bioluminescence
[00:37:43–00:37:46] without knowing that word.
[00:37:46–00:37:49] That's where semantic search can help.
[00:37:49–00:37:51] A model turns text into numbers
[00:37:51–00:37:53] that represent patterns and meaning.
[00:37:53–00:37:56] We can then look for articles with similar representations
[00:37:56–00:37:59] even when they use different words.
[00:37:59–00:38:03] Similar meaning doesn't always mean the right answer.
[00:38:03–00:38:05] A search about one space mission
[00:38:05–00:38:07] might return another mission instead.
[00:38:07–00:38:11] That's why we'll keep keyword search also.
[00:38:11–00:38:13] We'll build the semantic search first
[00:38:13–00:38:15] then combine the two result list
[00:38:15–00:38:17] and see whether that helps.
[00:38:17–00:38:18] To compare meanings,
[00:38:18–00:38:21] we first need to turn text into numbers.
[00:38:22–00:38:26] That list of numbers is called an embedding or a vector.
[00:38:26–00:38:31] Our local model produces 348 numbers for each input.
[00:38:32–00:38:34] We'll prepare roughly 25,000 articles
[00:38:34–00:38:36] to keep the exercise manageable.
[00:38:36–00:38:40] Keyword search will still cover the full collection.
[00:38:40–00:38:42] We'll give the model the title
[00:38:42–00:38:44] and beginning of each article.
[00:38:44–00:38:47] The code takes the first 1500 body characters
[00:38:47–00:38:49] and the model can shorten that further
[00:38:49–00:38:52] to fit its input limit.
[00:38:52–00:38:56] So this search represents article introductions.
[00:38:56–00:38:58] It may miss an idea that only appears
[00:38:58–00:39:00] near the end of a long article.
[00:39:00–00:39:01] So now let's give the database
[00:39:01–00:39:04] somewhere to store those vectors.
[00:39:04–00:39:06] This command adds a column with room
[00:39:06–00:39:10] for the 384 numbers our model produces.
[00:39:10–00:39:13] It creates the storage, the next step fills it.
[00:39:13–00:39:15] We'll use the same fixed model version
[00:39:15–00:39:16] for articles and search queries
[00:39:16–00:39:19] so their vectors can be compared.
[00:39:19–00:39:22] Now I've already run this
[00:39:22–00:39:24] and just so you know,
[00:39:24–00:39:25] I've been running a lot of different things
[00:39:25–00:39:27] but the only things you really need to run
[00:39:27–00:39:31] to get this app working are all in the read me.
[00:39:31–00:39:35] So basically instead of running these files
[00:39:35–00:39:39] I ran like the broken down version
[00:39:39–00:39:40] so I can explain them better.
[00:39:40–00:39:42] But this one you can just run directly.
[00:39:42–00:39:45] The one that I was just looking at.
[00:39:45–00:39:47] And next we're gonna be running embed.py.
[00:39:47–00:39:49] So let's look at that one.
[00:39:49–00:39:52] We're looking at the file embed.py.
[00:39:52–00:39:54] So before we start notice
[00:39:54–00:39:57] which article the scripts chooses.
[00:39:57–00:40:02] If we scroll down here, we'll scroll down
[00:40:02–00:40:04] and then we can see that it takes the longest
[00:40:04–00:40:07] 25,000 articles and includes volcano
[00:40:07–00:40:10] and bioluminescence for our examples.
[00:40:10–00:40:15] That can give us up to 25,002 articles.
[00:40:15–00:40:18] It returns the same group if we restart it.
[00:40:18–00:40:20] That way an interrupted run
[00:40:20–00:40:22] finishes the original job
[00:40:22–00:40:26] instead of starting another group.
[00:40:26–00:40:29] So basically you are gonna wanna run this command
[00:40:29–00:40:33] to start the embedding job.
[00:40:33–00:40:36] That's how we'll generate the embeddings.
[00:40:36–00:40:39] So I've personally already run it
[00:40:39–00:40:41] and on the first run the model downloads
[00:40:41–00:40:44] and after that it computes the vectors on this computer
[00:40:44–00:40:47] and saves them to the database and batches.
[00:40:47–00:40:48] If you've already completed this step
[00:40:48–00:40:52] the script will report that there is nothing left to do.
[00:40:52–00:40:54] That step can take a while.
[00:40:54–00:40:56] If the connection fails
[00:40:56–00:40:58] and the script stops after retrying
[00:40:58–00:41:01] you can just run the same command again.
[00:41:01–00:41:03] Save batches stay in the database
[00:41:03–00:41:06] and the script picks up the missing work.
[00:41:06–00:41:08] Wait for completion before moving on.
[00:41:09–00:41:13] Now let's talk about vector storage and the index.
[00:41:13–00:41:15] So running this command,
[00:41:15–00:41:18] this SQL will make sure the job finished
[00:41:18–00:41:21] and we wanna look for missing embeddings.
[00:41:21–00:41:25] We want zero missing vectors in the group we selected.
[00:41:25–00:41:26] The rest of the collections
[00:41:26–00:41:28] can still have no vectors that's expected.
[00:41:28–00:41:32] We only prepared part of it for the semantic search.
[00:41:32–00:41:34] Okay, now we're gonna run this SQL code.
[00:41:34–00:41:35] We have the vectors
[00:41:35–00:41:39] but we also need a fast way to search them.
[00:41:39–00:41:41] This command builds a vector index
[00:41:41–00:41:43] using PG vector scale.
[00:41:43–00:41:48] Think of it as the lookup structure for our semantic search.
[00:41:48–00:41:52] Just as the BM25 index supports our keyword search.
[00:41:52–00:41:55] We wanna make sure to wait for the build
[00:41:55–00:41:58] and the statistics update to finish.
[00:41:58–00:42:01] Now I'm gonna look in the SQL slash search semantic
[00:42:01–00:42:03] that SQL file.
[00:42:03–00:42:06] This semantic query compares a search vector
[00:42:06–00:42:08] with article vectors.
[00:42:08–00:42:12] A smaller distance means a closer match
[00:42:12–00:42:14] so the closest one comes first.
[00:42:14–00:42:17] The index uses an approximate search to reduce the work
[00:42:17–00:42:20] which means it can miss some nearest matches.
[00:42:20–00:42:22] And a close match can still be a poor answer.
[00:42:23–00:42:27] So let's try it and read the results.
[00:42:27–00:42:31] Okay, let's try out some semantic search examples.
[00:42:31–00:42:36] So I'm going to run a query query.py
[00:42:36–00:42:38] animals that make their own light
[00:42:38–00:42:40] and put mode semantic.
[00:42:40–00:42:43] The script turns those words into a vector
[00:42:43–00:42:48] and asks PostgreSQL for nearby article vectors.
[00:42:48–00:42:50] And look at the titles.
[00:42:50–00:42:53] Which one helps answer that question?
[00:42:53–00:42:55] If an article you expected is missing,
[00:42:55–00:42:58] remember that semantic search can only find articles
[00:43:00–00:43:01] we've given in embedding.
[00:43:01–00:43:03] The first query may also take longer
[00:43:03–00:43:05] while the model loads.
[00:43:05–00:43:07] Now let's try the Apollo 13 next.
[00:43:07–00:43:10] This time we're looking for a specific mission.
[00:43:10–00:43:12] Okay, we can see whether the results state
[00:43:12–00:43:15] on that mission or drift towards other space topics.
[00:43:15–00:43:19] So this helps us see where matching meaning works well
[00:43:19–00:43:21] and where exact words still matter.
[00:43:21–00:43:26] So we now have keyword results and semantic results.
[00:43:26–00:43:29] So let's combine them into one list.
[00:43:29–00:43:30] How do we combine two searches
[00:43:30–00:43:33] that use different scoring systems?
[00:43:33–00:43:35] Well, a BM25 score and a vector distance
[00:43:35–00:43:37] aren't directly comparable.
[00:43:37–00:43:39] So adding their raw numbers wouldn't give us
[00:43:39–00:43:41] a useful ranking.
[00:43:41–00:43:45] Instead, we'll use where each article appears
[00:43:45–00:43:48] in each list, first, second, third, and so on.
[00:43:48–00:43:53] This method is called reciprocal rank fusion or RRF.
[00:43:53–00:43:57] An article earns points for its position in each list
[00:43:57–00:43:59] and higher positions earn more points.
[00:43:59–00:44:03] If both searches find the same article,
[00:44:03–00:44:06] it gets a contribution from both.
[00:44:06–00:44:08] Let's see that with two example articles.
[00:44:09–00:44:11] Article A is second in keyword search
[00:44:11–00:44:14] and third in semantic search.
[00:44:14–00:44:19] The formula here converts each position into points.
[00:44:19–00:44:22] One divided by 60 plus the position.
[00:44:22–00:44:27] For A, we add one over 62 and one over 63.
[00:44:27–00:44:31] That gives about 0.032.
[00:44:31–00:44:33] You don't need to memorize arithmetic.
[00:44:33–00:44:37] Just notice that the A gets points from both lists.
[00:44:37–00:44:40] Article B is first in keyword search
[00:44:40–00:44:43] but missing from semantic search.
[00:44:43–00:44:45] It earns points from only one list
[00:44:45–00:44:50] for a total of about 0.0164.
[00:44:50–00:44:52] So A finishes ahead in this example.
[00:44:52–00:44:57] Both methods finding A gives enough combined points to beat B.
[00:44:59–00:45:00] The 16 in the formula controls
[00:45:00–00:45:02] how strongly positions differ
[00:45:02–00:45:05] if it isn't the number of results.
[00:45:05–00:45:09] Our app starts by giving the two methods equal weight.
[00:45:09–00:45:12] It multiplies each contribution by one half.
[00:45:12–00:45:15] That makes these totals smaller but keeps A ahead of B.
[00:45:15–00:45:17] Later we can adjust the balance
[00:45:17–00:45:21] if one method is more useful for our users.
[00:45:21–00:45:23] Here's how I'll do that in the app.
[00:45:23–00:45:26] Keyword search gives us 20 possible results
[00:45:26–00:45:28] and semantic search gives us 20.
[00:45:28–00:45:29] We call those candidates.
[00:45:29–00:45:32] We combine their points and keep the best 10.
[00:45:32–00:45:34] This lets us work with two small lists
[00:45:34–00:45:38] instead of combining the entire collection.
[00:45:38–00:45:43] So this search hybrid is basically how they get combined.
[00:45:44–00:45:46] The SQL follows that same sequence.
[00:45:46–00:45:50] These names sections collect the keyword candidates
[00:45:50–00:45:52] and the vector candidates.
[00:45:54–00:45:56] The next two sections
[00:45:56–00:45:58] give each article its position in its list.
[00:45:58–00:46:02] You can read it as a series of steps.
[00:46:02–00:46:05] If you get two lists, then number their results.
[00:46:05–00:46:08] The with clause lets us name those steps
[00:46:08–00:46:12] so the query is easier to follow.
[00:46:12–00:46:15] An article has to reach at least one of these candidate lists
[00:46:15–00:46:17] to appear in the final results.
[00:46:17–00:46:19] We start with 20 candidates per method.
[00:46:19–00:46:21] Later you could try a larger list
[00:46:21–00:46:22] to see whether they improve the results
[00:46:22–00:46:25] enough to justify the extra work.
[00:46:25–00:46:29] Here we give each article points for its positions.
[00:46:29–00:46:32] We bring the two sets of contributions together
[00:46:32–00:46:35] and add the points for matching articles ID.
[00:46:35–00:46:36] Then we keep the 10 highest totals
[00:46:36–00:46:39] and fester titles and previews
[00:46:39–00:46:42] and that's our hybrid search.
[00:46:42–00:46:44] Two lists combined into one ranking.
[00:46:44–00:46:47] So I'll run the hybrid command.
[00:46:48–00:46:50] Okay, we run, we explained it.
[00:46:50–00:46:54] So let me explain this explained to you.
[00:46:54–00:46:59] So we first we can look at the CTE keyword candidates.
[00:46:59–00:47:01] We can see semantic search,
[00:47:01–00:47:06] we can see the semantic search uses the BM25 exit index
[00:47:08–00:47:11] to select, see it says 20 rows.
[00:47:11–00:47:15] So 20 candidate articles for Apollo 13.
[00:47:15–00:47:17] There are possible results before,
[00:47:17–00:47:18] these are possible results
[00:47:18–00:47:21] before we combine the two search methods.
[00:47:21–00:47:24] Then we have the CTE vector candidates,
[00:47:24–00:47:27] article embeddings IDX
[00:47:27–00:47:29] and the actual rows 20.
[00:47:29–00:47:33] So semantic search also selects 20 candidates
[00:47:33–00:47:35] using the vector index.
[00:47:35–00:47:37] That long list of numbers
[00:47:37–00:47:40] is the embeddings of our search text.
[00:47:40–00:47:42] We can skip the individual numbers.
[00:47:42–00:47:44] The important part is that both searches
[00:47:44–00:47:47] are using these indexes.
[00:47:47–00:47:52] Here we can see append actual rows 40.
[00:47:52–00:47:57] And then we have the hash aggregate rows 32.
[00:47:57–00:47:59] So this brings the two lists together.
[00:47:59–00:48:02] 20 plus 20 gives us 40 entries
[00:48:02–00:48:04] but some refer to the same article.
[00:48:04–00:48:06] After grouping by article ID,
[00:48:06–00:48:08] we have 32 distinct articles.
[00:48:08–00:48:12] That tells us eight articles appeared in both lists.
[00:48:12–00:48:16] Each article receives points based on its position
[00:48:16–00:48:18] and articles found by both methods
[00:48:18–00:48:20] receive contributions from both.
[00:48:20–00:48:24] We can also see CTE top results
[00:48:24–00:48:28] then limit actual rows 10.
[00:48:28–00:48:30] We sort those combined scores
[00:48:30–00:48:32] and we keep the 10 highest ranked articles.
[00:48:32–00:48:34] Then the query fetches their details
[00:48:34–00:48:38] and prepares the previews for the results page.
[00:48:38–00:48:43] And then we can see the execution time of 71 milliseconds.
[00:48:43–00:48:45] The database completed this query
[00:48:46–00:48:48] basically in about 71 milliseconds on this run.
[00:48:48–00:48:51] That doesn't include loading the Python model
[00:48:51–00:48:53] or creating the search embeddings.
[00:48:53–00:48:55] The plan confirms that our two searches feed
[00:48:55–00:48:56] into one combined ranking.
[00:48:56–00:48:58] So next let's look at the actual title
[00:48:58–00:49:00] to just whether that ranking is useful.
[00:49:01–00:49:06] So I'm gonna run the query again with mode hybrid.
[00:49:06–00:49:08] And this is the results,
[00:49:08–00:49:11] the result of combining all of those.
[00:49:11–00:49:15] And actually let's just run all one at a time.
[00:49:15–00:49:20] So basically mode keyword, mode semantic and mode hybrid.
[00:49:20–00:49:23] And we're gonna see what they,
[00:49:23–00:49:26] so I basically ran it all the different ways
[00:49:26–00:49:28] when we're seeing the different results.
[00:49:28–00:49:31] So here are the keyword results.
[00:49:31–00:49:34] Here are the semantic results.
[00:49:34–00:49:37] And here are the hybrid results.
[00:49:37–00:49:39] So combining methods can help,
[00:49:39–00:49:41] but we need to check rather than assume
[00:49:41–00:49:44] it improves every query.
[00:49:44–00:49:46] What if semantic search is more useful
[00:49:46–00:49:49] for the queries people type?
[00:49:49–00:49:51] We can give it more influence.
[00:49:51–00:49:54] A semantic weight of 0.7 gives it 70% of the weight
[00:49:54–00:49:57] with 30% for keyword search.
[00:49:57–00:49:58] We're still using list positions.
[00:49:58–00:50:02] We're just changing how much each method contributes.
[00:50:02–00:50:06] So if I go to the app.py file here,
[00:50:06–00:50:10] we can go down and look at this semantic weight.
[00:50:10–00:50:14] This setting in the API controls that balance.
[00:50:14–00:50:17] Zero uses keyword search alone.
[00:50:17–00:50:20] One uses semantic search alone.
[00:50:20–00:50:23] And the values between them combine the two.
[00:50:24–00:50:26] So you can look through this code
[00:50:26–00:50:29] to see all the different end points,
[00:50:29–00:50:32] the different URL end points and how they work.
[00:50:32–00:50:33] To judge whether that helps,
[00:50:33–00:50:35] you can use the same save queries each time.
[00:50:35–00:50:36] You can change the weight.
[00:50:36–00:50:40] Then look at what moves up or down.
[00:50:40–00:50:42] And then if you keep the query the same,
[00:50:42–00:50:44] it makes it easier to see the effect of the setting.
[00:50:44–00:50:47] Let's look back at our three lists
[00:50:47–00:50:50] from the Apollo 13 search.
[00:50:50–00:50:53] So did hybrid search move a useful article closer to the top?
[00:50:53–00:50:56] Did it push a useful one down?
[00:50:56–00:51:00] Basically it kind of is kind of up to us.
[00:51:00–00:51:05] But if we look, we can see that Apollo 13
[00:51:05–00:51:10] appears higher on the list in the hybrid
[00:51:10–00:51:13] than in semantic.
[00:51:13–00:51:18] And Apollo 13 goes at the top for keyword,
[00:51:18–00:51:23] but then we miss some other things that are also important.
[00:51:23–00:51:26] So I would say that the hybrid result is the best
[00:51:26–00:51:28] when we look at these search terms.
[00:51:28–00:51:31] But there is one limitation in our comparison.
[00:51:31–00:51:34] Keyword search covers the whole collection,
[00:51:34–00:51:38] but semantic search covers the articles we embedded.
[00:51:38–00:51:41] An article without a vector can't earn semantic points.
[00:51:41–00:51:44] So to compare the methods on equal covers
[00:51:44–00:51:47] we need to use the same sort of articles
[00:51:47–00:51:51] for both or embed the rest of the collection.
[00:51:52–00:51:56] As you improve the app, test one change at a time.
[00:51:56–00:51:58] You could give it more candidates
[00:51:58–00:52:01] or add embeddings for more articles.
[00:52:01–00:52:02] Repeat the same queries,
[00:52:02–00:52:04] check whether the results are more useful
[00:52:04–00:52:07] and see how long the searches take.
[00:52:07–00:52:09] For now, our three search methods are ready.
[00:52:09–00:52:13] So let's put them behind a webpage.
[00:52:13–00:52:15] Well, that's what we've done in this app.py
[00:52:15–00:52:17] that we've already looked at.
[00:52:18–00:52:21] The webpage needs a way to ask Python for search results
[00:52:21–00:52:23] and that's the job of our API,
[00:52:23–00:52:25] which is built with fast API.
[00:52:25–00:52:28] So the search endpoint right here
[00:52:28–00:52:31] receives the words to search for,
[00:52:31–00:52:34] the chosen mode and the number of results.
[00:52:34–00:52:37] It checks those inputs before doing the search.
[00:52:37–00:52:41] And here we can see the queries mapping.
[00:52:41–00:52:46] The mapping chooses the SQL file for each mode.
[00:52:46–00:52:49] Keyword mode can search directly semantic and hybrid mode
[00:52:49–00:52:52] first from the user's words into a vector
[00:52:52–00:52:55] and see it's gonna be using this to encode.
[00:52:55–00:52:57] The app reuses the loaded model
[00:52:57–00:53:00] so it doesn't have to load it again for every request.
[00:53:02–00:53:06] Then later we have the condot execute
[00:53:07–00:53:09] and then we get a response.
[00:53:09–00:53:12] The app sends the SQL and its parameter value
[00:53:12–00:53:15] to PostgreSQL then returns the articles
[00:53:15–00:53:18] and it elapsed time to the page.
[00:53:18–00:53:22] That time includes creating the query vector when needed.
[00:53:22–00:53:23] It's a broader measurement
[00:53:23–00:53:26] than the database execution time we saw earlier.
[00:53:26–00:53:28] So keep those two timings separate
[00:53:28–00:53:30] when comparing performance.
[00:53:31–00:53:35] So let's look at this configure and the lifespan here.
[00:53:35–00:53:38] Every search needs a database connection.
[00:53:38–00:53:40] So instead of opening a new one each time,
[00:53:40–00:53:43] the app keeps a small pool it can reuse.
[00:53:43–00:53:47] Here the pool allows up to four connections.
[00:53:47–00:53:50] Each connection is prepared to handle vectors
[00:53:50–00:53:52] and English text search.
[00:53:52–00:53:54] A timeout also prevents a database statement
[00:53:54–00:53:56] from running indefinitely.
[00:53:57–00:53:59] So next we're gonna start the app.
[00:53:59–00:54:02] Basically we're gonna use this command right here
[00:54:02–00:54:03] from the read me.
[00:54:03–00:54:06] And I'll just use that to start the app.
[00:54:06–00:54:10] It's already started and we can actually check it out again.
[00:54:10–00:54:13] So we're gonna test it.
[00:54:13–00:54:15] Basically it has everything we've been building toward.
[00:54:15–00:54:17] Now it has this example, animals that make their own light
[00:54:17–00:54:19] which we're gonna actually just paste in
[00:54:19–00:54:20] and use that example
[00:54:20–00:54:22] because we've been using it this whole time
[00:54:22–00:54:25] and we can change between hybrid keyword and semantic
[00:54:25–00:54:27] these ones that we've been building toward.
[00:54:27–00:54:32] So hybrid and we can switch to keyword.
[00:54:32–00:54:35] We can choose switch to semantic.
[00:54:35–00:54:38] The highlight words help explain the keyword matches.
[00:54:38–00:54:40] You can follow the source links
[00:54:40–00:54:43] to read the original articles.
[00:54:43–00:54:44] But let's see what else we can do.
[00:54:44–00:54:46] I'm gonna start a new terminal
[00:54:47–00:54:49] and I'm gonna run this curl command.
[00:54:49–00:54:52] So we're basically trying the weight setting.
[00:54:52–00:54:53] Okay, let's go a bit.
[00:54:53–00:54:55] We see this command.
[00:54:55–00:54:58] We got the results, a lot of results here.
[00:54:59–00:55:03] Basically we are, this request gives semantic search
[00:55:03–00:55:07] 70% of the weight and keyword search 30%.
[00:55:07–00:55:10] And then the response shows the return articles.
[00:55:10–00:55:12] So we could compare the titles
[00:55:12–00:55:14] with the equal weight hybrid results
[00:55:14–00:55:19] and see whether the changed balance helps the query.
[00:55:19–00:55:22] Our app also has a way to insert articles.
[00:55:22–00:55:27] So if I go to app.py, I can look at add articles here.
[00:55:28–00:55:30] Now I'm gonna open this demo insert.py
[00:55:30–00:55:33] which is going to use that to add an article.
[00:55:33–00:55:36] Our app can search existing articles
[00:55:36–00:55:39] and so this helper sends a sample title, body
[00:55:39–00:55:40] and URL to the API.
[00:55:41–00:55:44] Adding content requires an admin token.
[00:55:44–00:55:46] The helper reads that token from our environment file
[00:55:46–00:55:50] so we don't have to type or show it on screen.
[00:55:50–00:55:53] So here's the article write sequence.
[00:55:53–00:55:55] We want the article to arrive ready
[00:55:55–00:55:56] for both search methods.
[00:55:56–00:55:59] First, the app creates its vector.
[00:55:59–00:56:01] Then it saves the text and vector together
[00:56:01–00:56:03] in a database transaction.
[00:56:03–00:56:06] A transaction lets us save the change as a unit
[00:56:06–00:56:09] or undo it if it fails.
[00:56:09–00:56:13] If vector generation fails first, no article is inserted.
[00:56:13–00:56:16] The API reports success after the database
[00:56:16–00:56:19] commits the right, including the index updates.
[00:56:19–00:56:22] So I'm gonna run the command, the demo insert command.
[00:56:23–00:56:25] So it's been inserted.
[00:56:25–00:56:30] Now I'm gonna search for that on our browser.
[00:56:30–00:56:34] Okay, just search for this and it appears.
[00:56:34–00:56:36] So for semantic it's number two.
[00:56:36–00:56:41] If I do a keyword, it will appear as the type top one
[00:56:41–00:56:45] and a hybrid it will appear as the top one.
[00:56:45–00:56:48] So it has both vector and,
[00:56:48–00:56:50] it has both text and a vector
[00:56:50–00:56:52] so all three modes can use it.
[00:56:52–00:56:56] We haven't explored the article to a separate search service.
[00:56:56–00:56:59] The text and search indexes are in PostgreSQL.
[00:56:59–00:57:01] Okay, I can search for other things.
[00:57:01–00:57:03] I search for plants that eat bugs
[00:57:03–00:57:06] and we can see the top one is carnivorous plant.
[00:57:06–00:57:07] So the app works.
[00:57:07–00:57:09] As the collection grows,
[00:57:09–00:57:10] we'll also need to watch how the database handles
[00:57:10–00:57:12] with searches and updates.
[00:57:12–00:57:13] For the initial import,
[00:57:13–00:57:16] we loaded the articles before building the indexes.
[00:57:16–00:57:19] That avoided updating each index for every incoming row.
[00:57:19–00:57:21] Building an index still takes resources
[00:57:21–00:57:24] so plan for that work on a busy service.
[00:57:24–00:57:27] So how does this compare at a much larger scale?
[00:57:27–00:57:29] TigerData published a benchmark
[00:57:29–00:57:32] using about 138 million passages
[00:57:32–00:57:37] comparing PG Tech search 1.0 with ParadeDB 0.21.6.
[00:57:41–00:57:44] In that vendor run test with data already cast,
[00:57:44–00:57:47] PG Tech search answered short queries faster
[00:57:47–00:57:49] and handled more concurrent queries.
[00:57:49–00:57:53] ParadeDB built its index about twice as fast.
[00:57:53–00:57:56] Those results describe that particular experiment.
[00:57:56–00:57:58] These are measurements of our app
[00:57:58–00:58:01] or of version 1.5.1.
[00:58:01–00:58:02] So use them as background
[00:58:02–00:58:04] then test your own data and queries.
[00:58:04–00:58:06] Check result quality, how long searches take
[00:58:06–00:58:08] and what happens when several people search
[00:58:08–00:58:10] while articles are being updated.
[00:58:10–00:58:14] The benchmark methodology is linked in the resources.
[00:58:14–00:58:16] We now have keyword semantic and hybrid search.
[00:58:16–00:58:20] What you add next should depend on what user struggle with.
[00:58:20–00:58:21] If they misspelled words,
[00:58:21–00:58:23] you'll need an additional approach for typo tolerance.
[00:58:23–00:58:26] If relevant articles have no vectors,
[00:58:26–00:58:28] wider embedding covers may help.
[00:58:28–00:58:30] The readme includes optional filtering
[00:58:30–00:58:33] and tuning examples for further work.
[00:58:33–00:58:34] For this project,
[00:58:34–00:58:37] keeping articles and searches in PostgreSQL
[00:58:37–00:58:38] lets us work with SQL
[00:58:38–00:58:41] and save changes through database transactions.
[00:58:41–00:58:44] A dedicated search platform may suit other requirements.
[00:58:45–00:58:46] We now have a working app
[00:58:46–00:58:49] we can test to decide what we need.
[00:58:49–00:58:51] And there's so much more we can do in our database
[00:58:51–00:58:55] right within Tiger Data Cloud.
[00:58:55–00:58:57] So we can go to the Explorer
[00:58:57–00:59:01] if we want to explore the different articles.
[00:59:01–00:59:04] So this is our database schema.
[00:59:04–00:59:06] We can look at what indexes we have.
[00:59:06–00:59:09] We can look at the foreign keys.
[00:59:09–00:59:11] We can see logs
[00:59:11–00:59:13] from what's been happening with our database.
[00:59:13–00:59:18] And there's even stuff we can do to add security
[00:59:18–00:59:21] and just a lot of other features that we get
[00:59:21–00:59:24] when we're using Tiger Data Cloud.
[00:59:24–00:59:25] And the description links
[00:59:25–00:59:28] to project files, execution documentation and dataset.
[00:59:28–00:59:31] You can use them to repeat these examples
[00:59:31–00:59:35] or build a search over your own articles.
[00:59:35–00:59:39] And the readme will just give a lot more information
[00:59:39–00:59:41] of what you can do with this.
[00:59:41–00:59:43] And you can continue with this
[00:59:43–00:59:44] for your next experiment.
[00:59:44–00:59:47] Maybe you want to pick one thing you want to improve
[00:59:47–00:59:48] embed more articles to expand coverage
[00:59:48–00:59:51] or split long articles into smaller passages
[00:59:51–00:59:54] so a search can reach beyond their introductions.
[00:59:54–00:59:56] You could also try a re-ranker,
[00:59:56–00:59:57] a model that takes the first result
[00:59:57–01:00:00] and examines them more closely to re-order them.
[01:00:00–01:00:02] Repeat the same test queries
[01:00:02–01:00:06] and check whether better results are worth the extra time.
[01:00:06–01:00:08] You now have a working search app to experiment with.
[01:00:08–01:00:12] Try your own queries and read the results.
[01:00:12–01:00:13] Thanks for learning with me
[01:00:13–01:00:16] and thanks for watching Free Code Camp.
[01:00:16–01:00:18] I'll see you in the next course.
