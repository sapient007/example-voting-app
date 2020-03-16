def vote_pubsub(event, context):
    """Background Cloud Function to be triggered by Pub/Sub.
    Args:
         event (dict):  The dictionary with data specific to this type of
         event. The `data` field contains the PubsubMessage message. The
         `attributes` field will contain custom attributes if there are any.
         context (google.cloud.functions.Context): The Cloud Functions event
         metadata. The `event_id` field contains the Pub/Sub message ID. The
         `timestamp` field contains the publish time.
    
    Environment variables:
        DATASET_ID: < Dataset of bigquery>
        TABLE_ID: <table of bigquery>
    
    """


    import base64
    import os
    from google.cloud import bigquery

    client = bigquery.Client()
    dataset_id = os.getenv("DATASET_ID")
    table_id = os.getenv("TABLE_ID")
    table_ref = client.dataset(dataset_id).table(table_id)
    table = client.get_table(table_ref)
  
    if 'data' in event:
        vote = event['attributes'].get('vote')
        message = base64.b64decode(event['data']).decode('utf-8')
        
        #create row of data to insert into BQ
        row = (message,
            vote
        )
        rows_to_insert = [
            row
        ]
        try:
            client.insert_rows(table, rows_to_insert)  # insert to bq
            print("inserting vote for {} with selection {}".format(message, vote))
        except Exception as e:
            print("error encountered when inserting row into BQ: {}".format(e)) 

    else:
        #bad message do nothing
        print("Message received without data")