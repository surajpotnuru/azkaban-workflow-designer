import flask
import json
import flask_cors
import os
import subprocess
import requests
import shutil

hostIp = "127.0.0.1"


app = flask.Flask(__name__)
flask_cors.CORS(app)

@app.route("/")
def baseRoute():
    return flask.Response(
        status=403
    )

def fetchNodeDependencies(nodesData, linksData, key):
    nodeDependencies = []
    for link in linksData:
        if link["to"] == key:
            if link["from"] == 1:
                nodeDependencies.append('StartJob')
            else:
                if nodesData[str(link["from"])]['category'] == "Merge":
                    nodeDependencies.append(nodesData[str(link["from"])]['text'])
                else:
                    nodeDependencies.append(nodesData[str(link["from"])]['text'] + "_" + nodesData[str(link["from"])]['type'])
    return nodeDependencies

def checkForDuplicateNodes(nodesData):
    nodesNames = []
    for node in nodesData:
        nodesNames.append(
            (node['text'] + node['type']).upper()
        )
    if len(set(nodesNames)) == len(nodesNames):
        return False
    else:
        return True

@app.route("/submitjob", methods=["POST"])
def submit():
    if flask.request.content_type == "application/json":
        try:
            payload = json.loads(flask.request.data.decode("ascii"))
            clientName = payload["clientName"]
            projectName = payload["projectName"]
            workflowName = payload["workflowName"]
            renameEndJob = payload["renameEndJob"]
            graphData = payload["graphData"]
            cwd = os.getcwd()
            try:
                shutil.rmtree(os.getcwd() + "\\" + workflowName)
                os.remove(os.getcwd() + "\\" + workflowName + ".zip")
            except Exception as exp:
                pass
            newPath = os.path.join(cwd, workflowName)
            if not os.path.exists(newPath):
                os.makedirs(newPath)
                os.chdir(newPath)
            else:
                os.chdir(newPath)
            revoFileNameMapping = {
                "filecheck": "FileCheckExecutor.py",
                "datatransfer": "OozieDataTransferExecutor.py",
                "landing": "OozieLandingExecutor.py",
                "dqm": "OozieDQMExecutor.py",
                "bre": "OozieBREWorkflowExecutor.py",
                "export": "OozieExportExecutor.py"
            }
            nodesData = {}
            nodesData2 = graphData["nodeDataArray"]
            nodesAreDuplicate = checkForDuplicateNodes(nodesData2)
            if nodesAreDuplicate is False:
                for node in nodesData2:
                    nodesData[str(node['key'])] = node
                linksData = graphData["linkDataArray"]
                for node in nodesData2:
                    key = node["key"]
                    if node['text'] == "StartJob" and node['category'] == "Start" and node['type'] == "noop":
                        with open("StartJob.job","w+") as fp:
                            command = "#StartJob.Job\ntype=noop"
                            fp.write(command)
                    else:
                        jobDependencies = fetchNodeDependencies(nodesData,linksData,key)
                        jobType = node['type']
                        fileName = ""
                        if jobType in list(revoFileNameMapping.keys()):
                            jobName = node['text'] + "_" + node['type']
                            fileName = jobName + ".job"
                            command = "#{}\ntype=command\ncommand=python {} {} {} {}\ndependencies={}".format(
                                fileName,
                                revoFileNameMapping[jobType],
                                clientName,
                                projectName,
                                node['text'].upper(),
                                ",".join(jobDependencies)
                            )
                        elif jobType == "noop":
                            jobName = node['text']
                            fileName = jobName + ".job"
                            command = "#{}\ntype=noop\ndependencies={}".format(
                                fileName,
                                ",".join(jobDependencies)
                            )
                        else:
                            raise Exception("job type not supported")
                        with open(fileName,"w+") as fp:
                            fp.write(command)
                try:
                    if renameEndJob == "true":
                        endjobSrc = newPath + "\\EndJob.job"
                        endjobDest = newPath + "\\" + workflowName + ".job"
                        os.rename(endjobSrc, endjobDest)
                except Exception as exp:
                    print("Warning: Renaming EndJob.job failed")
                job_properties = "working.dir=/home/hadoop/CODE/BackEnd/"
                with open("job.properties","w+") as fp:
                    fp.write(job_properties)
                os.chdir(cwd)
                subprocess.check_output(['zip','-r', workflowName + '.zip', workflowName])
                responseData = {
                    "status": "success",
                    "message": "Zip file created"
                }
                return flask.Response(
                    response=json.dumps(responseData),
                    status=200,
                    mimetype='application/json'
                )
        except Exception as exp:
            data = {
                "status": "error",
                "message": str(exp)
            }
            return flask.Response(
                response=json.dumps(data),
                status=200,
                mimetype='application/json'
            )
    else:
        data = {
            "status": "error",
            "message": "Only application/json accepted as payload"
        }
        return flask.Response(
            response=json.dumps(data),
            status=200,
            mimetype='application/json'
        )


@app.route("/mergeprojects", methods=["POST"])
def mergeProjects():
    if flask.request.content_type == "application/json":
        try:
            payload = json.loads(flask.request.data.decode("ascii"))
            mergedProjectName = payload["mergedProjectName"].strip()
            sourceProjectsList = payload["sourceProjectsList"].split(",")
            sourceProjectsList = list(map(lambda x: x.strip(), sourceProjectsList))
            cwd = os.getcwd()
            print(mergedProjectName)
            print(sourceProjectsList)
            # Remove old dir if already present
            try:
                shutil.rmtree(cwd + "\\" + mergedProjectName)
                shutil.rmtree(cwd + "\\" + "temp_data")
            except Exception as exp:
                print(exp)
            os.makedirs(cwd + "\\" + mergedProjectName)
            for project in sourceProjectsList:
                src =  cwd + "\\" + project
                tgt = cwd + "\\" + "temp_data"
                shutil.copytree(src, tgt)
                if os.path.exists(cwd + "\\" + "temp_data" + "\\" + "EndJob.job"):
                    os.rename(
                        cwd + "\\" + "temp_data" + "\\" + "EndJob.job",
                        cwd + "\\" + "temp_data" + "\\" + project + ".job"
                    )
                jobsList = os.listdir(tgt)
                for job in jobsList:
                    shutil.copy(tgt + "\\" + job, cwd + "\\" + mergedProjectName + "\\" + job)
                shutil.rmtree(tgt)
            subprocess.check_output(['zip','-r', mergedProjectName + '.zip', mergedProjectName])
            data = {
                "status": "success",
                "message": "Projects merged"
            }
            return flask.Response(
                response=json.dumps(data),
                status=200,
                mimetype='application/json'
            )
        except Exception as exp:
            data = {
                "status": "error",
                "message": str(exp)
            }
            return flask.Response(
                response=json.dumps(data),
                status=200,
                mimetype='application/json'
            )
    else:
        data = {
            "status": "error",
            "message": "Only application/json accepted as payload"
        }
        return flask.Response(
            response=json.dumps(data),
            status=200,
            mimetype='application/json'
        )


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0"
    )
