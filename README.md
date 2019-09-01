# Azkaban Workflow Designer (AWD)


## Setup

The following set of commands run on *nix platforms like Linux, OS X.

```

git clone https://github.com/surajpotnuru/azkaban-workflow-designer.git

cd azkaban-workflow-designer

sh ec2-bootstrap.sh

```

## Start AWD

```
# start awd front end server

http-server ./

# start awd back end server

python3 backend.py


```