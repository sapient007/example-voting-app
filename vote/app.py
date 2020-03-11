from flask import Flask, render_template, request, make_response, g
import os
import socket
import random
import json
import logging
from google.cloud import pubsub_v1

logging.basicConfig()
logger = logging.getLogger('logger')

option_a = os.getenv('OPTION_A', "Bernie")
option_b = os.getenv('OPTION_B', "Biden")
hostname = socket.gethostname()

#get GCP environment variables
project_id = os.getenv("PROJECT_ID", "automl-document-mling")
topic_name = os.getenv("TOPIC_NAME", "votes")
topic_path = "projects/{}/topics/{}".format(project_id,topic_name)

app = Flask(__name__)

def get_pubsub():
    publisher = pubsub_v1.PublisherClient()
    ## used for demo purpose only. topic creation can be removed if created outside of application    
    try:
        publisher.create_topic(topic_path)
    except Exception as e:
        #do nothing topic already created
        logger.warn("Error while creating topic: {}".format(e))
    return publisher

@app.route("/", methods=['POST','GET'])
def hello():
    voter_id = request.cookies.get('voter_id')
    if not voter_id:
        voter_id = hex(random.getrandbits(64))[2:-1]

    vote = None

    if request.method == 'POST':
        vote = request.form['vote']
        publisher = get_pubsub()
        logger.warn("publishing vote for {} with election {} ".format(voter_id, vote))
        publisher.publish(topic_path, bytes(voter_id), vote=bytes(vote))

    resp = make_response(render_template(
        'index.html',
        option_a=option_a,
        option_b=option_b,
        hostname=hostname,
        vote=vote,
    ))
    resp.set_cookie('voter_id', voter_id)
    return resp


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80, debug=True, threaded=True)
