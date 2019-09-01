import flask
import json
import flask_cors
#import boto
#import boto3
import os
import subprocess
import requests

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
    # hostAddress = "http://" + hostIp +":8081"
    if flask.request.content_type == "application/json":
        try:
            payload = json.loads(flask.request.data.decode("ascii"))
            clientName = payload["clientName"]
            projectName = payload["projectName"]
            # azkabanUserName = payload["azkabanUserName"]
            # azkabanPassword = payload["azkabanPassword"]
            workflowName = payload["workflowName"]
            renameEndJob = payload["renameEndJob"]
            graphData = payload["graphData"]
            cwd = "C:\\"
            try:
                subprocess.check_output(['sudo', 'rm', '-r', workflowName])
                subprocess.check_output(['sudo', 'rm', '-r', workflowName + '.zip'])
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
                            # command = "#{}\ntype=command\ncommand=python /home/hadoop/CODE/BackEnd/{} {} {} {}\ndependencies={}".format(
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
                        subprocess.check_output(['mv','EndJob.job', workflowName + '.job'])
                except Exception as exp:
                    pass
                job_properties = "working.dir=/home/hadoop/CODE/BackEnd/"
                with open("job.properties","w+") as fp:
                    fp.write(job_properties)
                os.chdir(cwd)
                subprocess.check_output(['zip','-r', workflowName + '.zip', workflowName])
                responseData = {}
            #     headers = {
            #         "Content-Type": "application/x-www-form-urlencoded",
            #         "X-Requested-With": "XMLHttpRequest"
            #     }
            #     azkabanUserData = {
            #         "username": azkabanUserName,
            #         "password": azkabanPassword
            #     }
            #     authenticateURL = hostAddress + "/?action=login"
            #     authenticateRequest = requests.post(
            #         authenticateURL,
            #         data = azkabanUserData,
            #         headers = headers
            #     )
            #     authenticateResponse = authenticateRequest.json()
            #     if authenticateResponse['status'] == "success":
            #         print("authentication successfull")
            #         sessionID = authenticateResponse['session.id']
            #         createNewProjectUrl = hostAddress + "/manager?action=create"
            #         createNewProjectRequestData = {
            #             "session.id": sessionID,
            #             "name": workflowName,
            #             "description": workflowName
            #         }
            #         createNewProjectRequest = requests.post(
            #             createNewProjectUrl,
            #             data = createNewProjectRequestData,
            #             headers = headers
            #         )
            #         createNewProjectResponse = createNewProjectRequest.json()
            #         if createNewProjectResponse['status'] == "success":
            #             print(cwd)
            #             command = "curl -k -i -H 'Content-Type: multipart/mixed' -X POST --form 'session.id={0}' --form 'ajax=upload' --form 'file=@{1};type=application/zip' --form 'project={2}' {3}/manager".format(
            #                 sessionID,
            #                 workflowName + '.zip',
            #                 workflowName,
            #                 hostAddress
            #             )
            #             subprocess.check_output([command], shell = True)
            #             responseData = {
            #                 "status": "success",
            #                 "message": "project created and uploaded"
            #             }
            #         else:
            #             responseData = createNewProjectResponse
            #     else:
            #         print("authentication failed")
            #         responseData = {
            #             "status": "error",
            #             "message": "authentication failed"
            #         }
            #     return flask.Response(
            #         response=json.dumps(responseData),
            #         status=200,
            #         mimetype='application/json'
            #     )
            # else:
            #     data = {
            #         "status": "error",
            #         "message": "there are duplicate nodes in the workflow"
            #     }
                responseData = {
                    "status": "success",
                    "message": "project created"
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
            "message": "only application/json accepted as payload"
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
