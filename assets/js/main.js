DEBUG = true
document.addEventListener('DOMContentLoaded', function () {
    var carouselElement = document.querySelectorAll('.carousel');
    var carouselInstance = M.Carousel.init(carouselElement, {
        fullWidth: true,
        indicators: false
    });
    var modalElements = document.querySelectorAll('.modal');
    var modalInstances = M.Modal.init(modalElements);
    $(".dropdown-trigger").dropdown({
        constrainWidth: false
    });
    if (localStorage.getItem("clientName") != null) {
        $("#client_name").val(localStorage.getItem("clientName"))
    }
    if (localStorage.getItem("projectName") != null) {
        $("#project_name").val(localStorage.getItem("projectName"))
    }
    // if (localStorage.getItem("azkabanUsername") != null) {
    //     $("#azkaban_username").val(localStorage.getItem("azkabanUsername"))
    // }
    // if (localStorage.getItem("azkabanPassword") != null) {
    //     $("#azkaban_password").val(localStorage.getItem("azkabanPassword"))
    // }
});
// $(document).keydown(function (e) {
//     if (e.keyCode == 39) {
//         $('.main-carousel').carousel('next')
//         DEBUG && console.log("Right Arrow Pressed")
//     }
//     if (e.keyCode == 37) {
//         $('.main-carousel').carousel('prev')
//         DEBUG && console.log("Left Arrow Pressed")
//     }
// });
function saveConfigDetails() {
    var clientName = $("#client_name").val()
    var projectName = $("#project_name").val()
    // var azkabanUsername = $("#azkaban_username").val()
    // var azkabanPassword = $("#azkaban_password").val()
    // if (clientName == "" || projectName == "" || azkabanUsername == "" || azkabanPassword == "") {
    if (clientName == "" || projectName == "") {
        var toastContent = "enter all details !!"
        M.toast({
            html: toastContent,
            classes: 'red-toast',
            displayLength: 1000
        })
    } else {
        localStorage.setItem("clientName", clientName)
        localStorage.setItem("projectName", projectName)
        // localStorage.setItem("azkabanUsername", azkabanUsername)
        // localStorage.setItem("azkabanPassword", azkabanPassword)
        localStorage.setItem("configPresent", true)
        var toastContent = "Config details saved"
        M.toast({
            html: toastContent,
            classes: 'green-toast',
            displayLength: 1000,
            completeCallback: function () {
                $('.main-carousel').carousel('next')
                toastContent = "Designer loaded with sample workflow"
                M.toast({
                    html: toastContent,
                    classes: 'green-toast',
                    displayLength: 2000
                })
            }
        })
    }
}
function editConfig() {
    $('.main-carousel').carousel('prev')
}
function openUploadJsonModal() {
    DEBUG && console.log("Triggered uploadJsonModal open")
    $("#uploadJsonModal").modal('open')
}
function openUploadJobsListModal(){
    DEBUG && console.log("Triggered uploadJobsListModal open")
    $("#uploadJobsListModal").modal('open')
}
function openMergeProjectsModel(){
    DEBUG && console.log("Triggered openMergeProjectsModel open")
    $("#mergeProjectsModal").modal('open')
}
function init() {
    hostIp = "127.0.0.1"
    var $$ = go.GraphObject.make;  // for conciseness in defining templates
    myDiagram =
        $$(go.Diagram, "myDiagramDiv",
            {
                allowCopy: true,
                "grid.visible": true,
                "grid.gridCellSize": new go.Size(30, 30),
                "clickCreatingTool.archetypeNodeData": {
                    text: "Enter Job Name",
                    category: "Enter Job Category",
                    type: "Enter Job Type"
                },
                "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
                initialContentAlignment: go.Spot.Center,
                layout:
                    $$(go.LayeredDigraphLayout,
                        {
                            setsPortSpots: false,  // Links already know their fromSpot and toSpot
                            columnSpacing: 5,
                            isInitial: false,
                            isOngoing: false,
                            direction: 90
                        }),
                validCycle: go.Diagram.CycleNotDirected,
                "undoManager.isEnabled": true
            });
    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener("Modified", function (e) {
        var button = document.getElementById("SaveButton");
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
            if (idx < 0) document.title += "*";
        } else {
            if (idx >= 0) document.title = document.title.substr(0, idx);
        }
    });
    var graygrad = $$(go.Brush, "Linear",
        { 0: "whitesmoke", 0.1: "whitesmoke", 0.9: "whitesmoke", 1: "whitesmoke" });
    myDiagram.nodeTemplate =  // the default node template
        $$(go.Node, "Spot",
            { selectionAdorned: false, textEditable: false, locationObjectName: "BODY" },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // the main body consists of a Rectangle surrounding the text
            $$(go.Panel, "Auto",
                {
                    name: "BODY",
                },
                $$(go.Shape, "RoundedRectangle",
                    { fill: graygrad, stroke: "gray", minSize: new go.Size(200, 60) },
                    new go.Binding("fill", "isSelected", function (s) { return s ? "#2196F3" : graygrad; }).ofObject()),
                $$(go.TextBlock, "Job Name:",
                    {
                        stroke: "black", font: "12px sans-serif", editable: false,
                        margin: new go.Margin(-15, 0, 0, 5), alignment: go.Spot.Left
                    }),
                $$(go.TextBlock,
                    {
                        stroke: "black", font: "12px sans-serif", editable: false,
                        margin: new go.Margin(-15, 0, 0, 70), alignment: go.Spot.Left
                    },
                    new go.Binding("text", "text").makeTwoWay()),
                $$(go.TextBlock, "Job Cat.:", {
                    stroke: "black", font: "12px sans-serif", editable: false,
                    margin: new go.Margin(5, 0, 0, 5), alignment: go.Spot.Left
                }),
                $$(go.TextBlock,
                    {
                        stroke: "black", font: "12px sans-serif", editable: false,
                        margin: new go.Margin(5, 0, 0, 70),
                        alignment: go.Spot.Left
                    },
                    new go.Binding("text", "category").makeTwoWay()),
                $$(go.TextBlock, "Job Type:", {
                    stroke: "black", font: "12px sans-serif", editable: false,
                    margin: new go.Margin(30, 0, 0, 5), alignment: go.Spot.Left
                }),
                $$(go.TextBlock,
                    {
                        stroke: "black", font: "12px sans-serif", editable: false,
                        margin: new go.Margin(30, 0, 0, 70),
                        alignment: go.Spot.Left
                    },
                    new go.Binding("text", "type").makeTwoWay()),
            ),
            // output port
            $$(go.Panel, "Auto",
                { alignment: go.Spot.Bottom, portId: "from", fromLinkable: true, cursor: "pointer", click: addNodeAndLink },
                $$(go.Shape, "Circle",
                    { width: 22, height: 22, fill: "white", stroke: "#2196F3", strokeWidth: 3 }),
                $$(go.Shape, "PlusLine",
                    { width: 11, height: 11, fill: null, stroke: "#2196F3", strokeWidth: 3 })
            ),
            // input port
            $$(go.Panel, "Auto",
                { alignment: go.Spot.Top, portId: "to", toLinkable: true },
                $$(go.Shape, "Circle",
                    { width: 8, height: 8, fill: "white", stroke: "gray" }),
                $$(go.Shape, "Circle",
                    { width: 4, height: 4, fill: "#2196F3", stroke: null })
            )
        );
    myDiagram.nodeTemplateMap.add("Start",
        $$(go.Node, "Spot",
            { selectionAdorned: false, textEditable: false, locationObjectName: "BODY" },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // the main body consists of a Rectangle surrounding the text
            $$(go.Panel, "Auto",
                { name: "BODY" },
                $$(go.Shape, "Rectangle",
                    { fill: graygrad, stroke: "gray", minSize: new go.Size(120, 35) },
                    new go.Binding("fill", "isSelected", function (s) { return s ? "#2196F3" : graygrad; }).ofObject()),
                $$(go.TextBlock,
                    {
                        stroke: "black", font: "12px sans-serif", editable: true,
                        margin: new go.Margin(3, 3 + 11, 3, 3 + 4), alignment: go.Spot.Center
                    },
                    new go.Binding("text", "text"))
            ),
            // output port
            $$(go.Panel, "Auto",
                { alignment: go.Spot.Bottom, portId: "from", fromLinkable: true, click: addNodeAndLink },
                $$(go.Shape, "Circle",
                    { width: 22, height: 22, fill: "white", stroke: "#2196F3", strokeWidth: 3 }),
                $$(go.Shape, "PlusLine",
                    { width: 11, height: 11, fill: null, stroke: "#2196F3", strokeWidth: 3 })
            )
        ));
    myDiagram.nodeTemplateMap.add("End",
        $$(go.Node, "Spot",
            { selectionAdorned: false, textEditable: false, locationObjectName: "BODY" },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // the main body consists of a Rectangle surrounding the text
            $$(go.Panel, "Auto",
                { name: "BODY" },
                $$(go.Shape, "Rectangle",
                    { fill: graygrad, stroke: "gray", minSize: new go.Size(120, 35) },
                    new go.Binding("fill", "isSelected", function (s) { return s ? "#2196F3" : graygrad; }).ofObject()),
                $$(go.TextBlock,
                    {
                        stroke: "black", font: "12px sans-serif", editable: true,
                        margin: new go.Margin(3 , 3 + 11, 3, 3 + 4), alignment: go.Spot.Center
                    },
                    new go.Binding("text", "text"))
            ),
            // input port
            $$(go.Panel, "Auto",
                { alignment: go.Spot.Top, portId: "to", toLinkable: true },
                $$(go.Shape, "Circle",
                    { width: 8, height: 8, fill: "white", stroke: "gray" }),
                $$(go.Shape, "Circle",
                    { width: 4, height: 4, fill: "#2196F3", stroke: null })
            )
        ));
    // dropping a node on this special node will cause the selection to be deleted;
    // linking or relinking to this special node will cause the link to be deleted
    myDiagram.nodeTemplateMap.add("Recycle",
        $$(go.Node, "Auto",
            {
                portId: "to", toLinkable: true, deletable: false,
                layerName: "Background", locationSpot: go.Spot.Center
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            { dragComputation: function (node, pt, gridpt) { return pt; } },
            { mouseDrop: function (e, obj) { myDiagram.commandHandler.deleteSelection(); } },
            $$(go.Shape,
                { fill: "lightgray", stroke: "gray" }),
            $$(go.TextBlock, "Drop Here\nTo Delete",
                { margin: 5, textAlign: "center" })
        ));
    // this is a click event handler that adds a node and a link to the diagram,
    // connecting with the node on which the click occurred
    function addNodeAndLink(e, obj) {
        var fromNode = obj.part;
        var diagram = fromNode.diagram;
        diagram.startTransaction("Add State");
        // get the node data for which the user clicked the button
        var fromData = fromNode.data;
        // create a new "State" data object, positioned off to the right of the fromNode
        var p = fromNode.location.copy();
        p.x += diagram.toolManager.draggingTool.gridSnapCellSize.width + 90;
        var toData = {
            text: "Enter Job Name",
            category: "Enter Job Category",
            type: "Enter Job Type",
            loc: go.Point.stringify(p)
        };
        // add the new node data to the model
        var model = diagram.model;
        model.addNodeData(toData);
        // create a link data from the old node data to the new node data
        var linkdata = {
            from: model.getKeyForNodeData(fromData),
            to: model.getKeyForNodeData(toData)
        };
        // and add the link data to the model
        model.addLinkData(linkdata);
        // select the new Node
        var newnode = diagram.findNodeForData(toData);
        diagram.select(newnode);
        // snap the new node to a valid location
        newnode.location = diagram.toolManager.draggingTool.computeMove(newnode, p);
        // then account for any overlap
        shiftNodesToEmptySpaces();
        diagram.commitTransaction("Add State");
    }
    // Highlight ports when they are targets for linking or relinking.
    var OldTarget = null;  // remember the last highlit port
    function highlight(port) {
        if (OldTarget !== port) {
            lowlight();  // remove highlight from any old port
            OldTarget = port;
            port.scale = 1.3;  // highlight by enlarging
        }
    }
    function lowlight() {  // remove any highlight
        if (OldTarget) {
            OldTarget.scale = 1.0;
            OldTarget = null;
        }
    }
    // Connecting a link with the Recycle node removes the link
    myDiagram.addDiagramListener("LinkDrawn", function (e) {
        var link = e.subject;
        if (link.toNode.category === "Recycle") myDiagram.remove(link);
        lowlight();
    });
    myDiagram.addDiagramListener("LinkRelinked", function (e) {
        var link = e.subject;
        if (link.toNode.category === "Recycle") myDiagram.remove(link);
        lowlight();
    });
    myDiagram.linkTemplate =
        $$(go.Link,
            { curve: go.Link.Bezier,  adjusting: go.Link.Stretch,
                reshapable: true, relinkableFrom: true, fromPortId: "from", toPortId: "to", relinkableTo: true },
            $$(go.Shape,
                { stroke: "gray", strokeWidth: 2 },
                {
                    mouseEnter: function (e, obj) { obj.strokeWidth = 2; obj.stroke = "#2196F3"; },
                    mouseLeave: function (e, obj) { obj.strokeWidth = 2; obj.stroke = "gray"; }
                }),
            $$(go.Shape, {
                toArrow: "Standard"
            })
        );
    function commonLinkingToolInit(tool) {
        // the temporary link drawn during a link drawing operation (LinkingTool) is thick and blue
        tool.temporaryLink =
            $$(go.Link, { layerName: "Tool" },
                $$(go.Shape, { stroke: "#2196F3", strokeWidth: 5 }));
        // change the standard proposed ports feedback from blue rectangles to transparent circles
        tool.temporaryFromPort.figure = "Circle";
        tool.temporaryFromPort.stroke = null;
        tool.temporaryFromPort.strokeWidth = 0;
        tool.temporaryToPort.figure = "Circle";
        tool.temporaryToPort.stroke = null;
        tool.temporaryToPort.strokeWidth = 0;
        // provide customized visual feedback as ports are targeted or not
        tool.portTargeted = function (realnode, realport, tempnode, tempport, toend) {
            if (realport === null) {  // no valid port nearby
                lowlight();
            } else if (toend) {
                highlight(realport);
            }
        };
    }
    var ltool = myDiagram.toolManager.linkingTool;
    commonLinkingToolInit(ltool);
    // do not allow links to be drawn starting at the "to" port
    ltool.direction = go.LinkingTool.ForwardsOnly;
    var rtool = myDiagram.toolManager.relinkingTool;
    commonLinkingToolInit(rtool);
    // change the standard relink handle to be a shape that takes the shape of the link
    rtool.toHandleArchetype =
        $$(go.Shape,
            { isPanelMain: true, fill: null, stroke: "#2196F3", strokeWidth: 5 });
    // use a special DraggingTool to cause the dragging of a Link to start relinking it
    myDiagram.toolManager.draggingTool = new DragLinkingTool();
    // detect when dropped onto an occupied cell
    myDiagram.addDiagramListener("SelectionMoved", shiftNodesToEmptySpaces);
    function shiftNodesToEmptySpaces() {
        myDiagram.selection.each(function (node) {
            if (!(node instanceof go.Node)) return;
            // look for Parts overlapping the node
            while (true) {
                var exist = myDiagram.findObjectsIn(node.actualBounds,
                    // only consider Parts
                    function (obj) { return obj.part; },
                    // ignore Links and the dropped node itself
                    function (part) { return part instanceof go.Node && part !== node; },
                    // check for any overlap, not complete containment
                    true).first();
                if (exist === null) break;
                // try shifting down beyond the existing node to see if there's empty space
                node.position = new go.Point(node.actualBounds.x, exist.actualBounds.bottom + 10);
            }
        });
    }
    if (window.Inspector) myInspector = new Inspector("myInspector", myDiagram, {
        properties: {
            "key": { readOnly: true },
            "comments": {}
        }
    });
    load("default");  // load initial diagram from the mySavedModel textarea
    layout();
}

function save() {
    diagramJson = myDiagram.model.toJson();
    var blob = new Blob([diagramJson], { type: "text/json;charset=utf-8" });
    var workflowName = $(".workflow_name").val()
    if (workflowName != "") {
        saveAs(blob, workflowName + ".json");
        myDiagram.isModified = false;
        M.toast({
            html: "workflow saved to local",
            classes: "green-toast"
        })
    } else {
        M.toast({
            html: "workflow name cannot be empty",
            classes: "red-toast"
        })
    }

}

function addEmptyNode(jobName, jobCategory, jobType){
    myDiagram.startTransaction("Add New Node")
    var model = myDiagram.model;
    var toData = {
        text: jobName,
        category: jobCategory,
        type: jobType,
        loc: "50 50"
    };
    model.addNodeData(toData);
    myDiagram.commitTransaction("Add New Node")
    var newnode = myDiagram.findNodeForData(toData);
    DEBUG && console.log(newnode)
    return newnode["$d"]["key"]
}

function detectLandingBre(jobName){
    jobName = jobName.toUpperCase();
    if (jobName.startsWith("LDG") || jobName.startsWith("LND")){
        return "landing"
    } else if (jobName.startsWith("WKFL") || jobName.startsWith("WF")){
        return "bre"
    } else {
        return "other"
    }
}

function addStartJob(){
    addEmptyNode(
        "StartJob",
        "Start",
        "noop"
    )
}

function addEndJob(){
    addEmptyNode(
        "EndJob",
        "End",
        "noop"
    )
}

function loadJobsList(){
    file = $("#inputFile2")[0]["files"][0]
    fileName = file.name
    fileType = file.type
    DEBUG && console.log(fileType)
    if (fileType == "text/plain") {
        var reader = new FileReader()
        reader.onloadend = function () {
            DEBUG && console.log(reader.result)
            jobsList = reader.result.split("\r");
            DEBUG && console.log(jobsList)
            if ($("#smartDesignCheckbox").prop('checked') == true){
                for (jobIndex in jobsList){
                    jobName = jobsList[jobIndex].replace(/(\r\n\t|\n|\r\t)/gm,"");
                    jobType = detectLandingBre(jobName)
                    if (jobType == "bre"){
                        addEmptyNode(
                            jobName,
                            "revo",
                            "bre"
                        )
                    } else if (jobType == "landing"){
                        fileCheckNodeKey = addEmptyNode(jobName, "revo", "filecheck")
                        dataTransferNodeKey = addEmptyNode(jobName, "revo", "datatransfer")
                        landingNodeKey = addEmptyNode(jobName, "revo", "landing")
                        dqmNodeKey = addEmptyNode(jobName, "revo", "dqm")
                        var model = myDiagram.model;
                        myDiagram.startTransaction("Adding Link")
                        var linkdata1 = {
                            from: fileCheckNodeKey,
                            to: dataTransferNodeKey
                        };
                        var linkdata2 = {
                            from: dataTransferNodeKey,
                            to: landingNodeKey
                        };
                        var linkdata3 = {
                            from: landingNodeKey,
                            to: dqmNodeKey
                        };
                        model.addLinkData(linkdata1);
                        model.addLinkData(linkdata2);
                        model.addLinkData(linkdata3);
                        DEBUG && console.log(linkdata1)
                        DEBUG && console.log(linkdata2)
                        DEBUG && console.log(linkdata3)
                        myDiagram.commitTransaction("Adding Link")
                    } else {
                        addEmptyNode(
                            jobName,
                            "revo",
                            ""
                        )
                    }
                }
                // addStartJob()
                // addEndJob()
                addEmptyNode(
                    "Merge1",
                    "Merge",
                    "noop"
                )
                layout()
            } else {
                for (jobIndex in jobsList){
                    addEmptyNode(
                        jobsList[jobIndex],
                        "revo",
                        ""
                    )
                }
                addEmptyNode(
                    "Merge1",
                    "Merge",
                    "noop"
                )
                layout()   
            }
            M.toast({
                html: "Jobs loaded to designer successfully",
                classes: "green-toast"
            })
            $('#uploadJobsListModal').modal('close');
        }
        reader.readAsBinaryString(file)
    } else {
        M.toast({
            html: 'only text files are allowed',
            classes: 'red-toast'
        })
    }
}

function load(loadMode) {
    if (loadMode == "default") {
        $(".workflow_name").val("default-workflow")
        var jqxhr = $.getJSON("default-workflow.json", function (data) {
            DEBUG && console.log("json file fetched successfully");
            myDiagram.model = go.Model.fromJson(data);
            layout()
        })
            .fail(function () {
                DEBUG && console.log("error in fetching json file");
            })
    } else {
        file = $("#inputFile")[0]["files"][0]
        fileName = file.name
        fileType = file.type
        DEBUG && console.log(fileType)
        if (fileType == "application/json") {
            $(".workflow_name").val(fileName.split(".")[0])
            var reader = new FileReader()
            reader.onloadend = function () {
                myDiagram.model = go.Model.fromJson(reader.result);
                layout()
                M.toast({
                    html: "Workflow loaded successfully",
                    classes: "green-toast"
                })
                $('#uploadJsonModal').modal('close');
            }
            reader.readAsBinaryString(file)
        } else {
            M.toast({
                html: 'Only .json formats are allowed',
                classes: 'red-toast'
            })
        }
    }
}

function mergeProjects(){
    mergedProjectName = $("#merged_project_name").val();
    sourceProjectsList = $("#source_projects_list").val();
    if (mergedProjectName == "" || sourceProjectsList == "") {
        M.toast({
            html: "Merged project name and Source projects cannot be empty",
            classes: "red-toast"
        })
    } else {
        postdata = {
            "mergedProjectName": mergedProjectName,
            "sourceProjectsList": sourceProjectsList
        }
        $.ajax({
            type: "POST",
            url: "http://" + hostIp + ":5000/mergeprojects",
            data: JSON.stringify(postdata),
            success: function (data) {
                if (data['message'] == "Projects merged") {
                    M.toast({
                        html: data['message'],
                        classes: 'green-toast'
                    })
                } else {
                    M.toast({
                        html: data['message'],
                        classes: 'red-toast'
                    })
                }
            },
            error: function (err) {
                M.toast({
                    html: JSON.parse(err.responseText)['message'],
                    classes: 'red-toast'
                })
            },
            dataType: "json",
            contentType: "application/json"
        });
    }
}

function createAzkabanProject() {
    diagramJson = myDiagram.model.toJson();
    clientName = $('#client_name').val();
    projectName = $('#project_name').val();
    // azkabanUserName = $('#azkaban_username').val();
    // azkabanPassword = $('#azkaban_password').val();
    workflowName = $(".workflow_name").val();
    renameEndJob = String($('#rename_end_job_checkbox').prop('checked'));
    // if (workflowName == "" || clientName == "" || projectName == "" || azkabanUserName == "" || azkabanPassword == "") {
    if (workflowName == "" || clientName == "" || projectName == "") {
        M.toast({
            html: "Workflow and Project details cannot be empty",
            classes: "red-toast"
        })
    } else {
        postdata = {
            "clientName": clientName,
            "projectName": projectName,
            // "azkabanUserName": azkabanUserName,
            // "azkabanPassword": azkabanPassword,
            "workflowName": workflowName,
            "renameEndJob": renameEndJob,
            "graphData": JSON.parse(diagramJson)
        }
        DEBUG && console.log(postdata)
        $('.deployButton').addClass("disabled");
        $.ajax({
            type: "POST",
            url: "http://" + hostIp + ":5000/submitjob",
            data: JSON.stringify(postdata),
            success: function (data) {
                if (data['message'] == "Zip file created") {
                    M.toast({
                        html: data['message'],
                        classes: 'green-toast'
                    })
                } else {
                    M.toast({
                        html: data['message'],
                        classes: 'red-toast'
                    })
                }
                $('.deployButton').removeClass("disabled");
            },
            error: function (err) {
                M.toast({
                    html: JSON.parse(err.responseText)['message'],
                    classes: 'red-toast'
                })
                $('.deployButton').removeClass("disabled");
            },
            dataType: "json",
            contentType: "application/json"
        });
    }

}


workFlowType = "json"
$(".workflow-upload-type i").click(function (event) {

    if (workFlowType == "json") {
        workFlowType = "excel"
        $(".workflow-upload-type p").html("excel")
        $(".workflow-upload-type i").addClass("fa-toggle-on")
        $(".workflow-upload-type i").removeClass("fa-toggle-off")
        $('.json-upload-type').hide()
        $('.excel-upload-type').show()
        $('#myDiagramDiv').hide()
        $('#excelDiv').show()
        $('.load-config-button').addClass("disabled").addClass("no-pointer")
        $('.auto-arrange-button').addClass("disabled").addClass("no-pointer")
        $('.inspector').hide()
        $('.node-editor-title').hide()

    }
    else if (workFlowType == "excel") {
        workFlowType = "json"
        $(".workflow-upload-type p").html("json")
        $(".workflow-upload-type i").addClass("fa-toggle-off")
        $(".workflow-upload-type i").removeClass("fa-toggle-on")
        $('.json-upload-type').show()
        $('.excel-upload-type').hide()
        $('#myDiagramDiv').show()
        $('#excelDiv').hide()
        $('.load-config-button').removeClass("disabled").removeClass("no-pointer")
        $('.auto-arrange-button').removeClass("disabled").removeClass("no-pointer")
        $('.inspector').show()
        $('.node-editor-title').show()
    }
});


function layout() {
    myDiagram.layoutDiagram(true);
}
// Define a custom tool that changes a drag operation on a Link to a relinking operation,
// but that operates like a normal DraggingTool otherwise.
function DragLinkingTool() {
    go.DraggingTool.call(this);
    this.isGridSnapEnabled = true;
    this.isGridSnapRealtime = false;
    this.gridSnapCellSize = new go.Size(182, 1);
    this.gridSnapOrigin = new go.Point(5.5, 0);
}
go.Diagram.inherit(DragLinkingTool, go.DraggingTool);
// Handle dragging a link specially -- by starting the RelinkingTool on that Link
/** @override */
DragLinkingTool.prototype.doActivate = function () {
    var diagram = this.diagram;
    if (diagram === null) return;
    this.standardMouseSelect();
    var main = this.currentPart;  // this is set by the standardMouseSelect
    if (main instanceof go.Link) { // maybe start relinking instead of dragging
        var relinkingtool = diagram.toolManager.relinkingTool;
        // tell the RelinkingTool to work on this Link, not what is under the mouse
        relinkingtool.originalLink = main;
        // start the RelinkingTool
        diagram.currentTool = relinkingtool;
        // can activate it right now, because it already has the originalLink to reconnect
        relinkingtool.doActivate();
        relinkingtool.doMouseMove();
    } else {
        go.DraggingTool.prototype.doActivate.call(this);
    }
};