#!/bin/bash

bq query --nouse_legacy_sql \
'DELETE from automl-document-mling.votes.votes WHERE 1=1'