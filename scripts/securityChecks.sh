#!/bin/bash
set -e

#  Check for existance of cypress.json
#  This file should NOT be in committed to the repo
#  otherwise it will expose sensitive content

FILE=cypress.json
if ! test -f "$FILE"; then
    echo "$FILE doesn't exist"
fi


#  Check for existance of secure variables from cypress json file
#  This variable should NOT be in build javascript files
#  otherwise it will expose sensitive content

STRING=EMAIL_ADDRESS
FOLDER=dist/assets/*

if [ -d dist/assets ]
then
    shopt -s nullglob
    for file in "$FOLDER"; do
        # [[ -f $file ]] || continue
        if ! grep -q "$STRING" $file; then
            echo "a string of $STRING doesn't exist"
        fi
    done
fi

