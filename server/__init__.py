
import os.path

from copy import deepcopy

import cherrypy

from girder.api import access
from girder.api.describe import Description, describeRoute
from girder.api.rest import filtermodel, loadmodel, Resource
from girder.constants import AccessType

from girder.plugins.worker import utils as workerUtils

from . import yaml_importer

class Osumo(Resource):
    # NOTE(opadron): 'tools.staticdir.dir' is set in load()
    _cp_config = {"tools.staticdir.on": True,
                  "tools.staticdir.index": "index.html"}

    def __init__(self):
        super(Osumo, self).__init__()
        self.resourceName = "osumo"
        self.route("POST", (), self.testOsumo)

    @access.user
    # @loadmodel(map={"fileId": "file"}, model="file", level=AccessType.READ)
    # @filtermodel(model="job", plugin="jobs")
    @describeRoute(
        Description("DESCRIPTION")
        .notes("NOTE")
        .param("itemId", "Item ID.", required=True)
        .param("targetId", "Destination ID", required=True)
        .param("numClusters", "Number of clusters to compute",
            required=False, dataType=int, default=2)
        .param("hasHeader", "Whether the first line of the file is a header",
            required=False, dataType=bool, default=False)
        .errorResponse()
        # TODO(opadron): Need a better error message
        .errorResponse("SOMETHING WENT WRONG", 403))
    def testOsumo(self, params):
        self.requireParams(("itemId", "targetId", "numClusters"), params)

        itemId = params["itemId"]
        targetId = params["targetId"]
        numClusters = params["numClusters"]
        hasHeader = params["hasHeader"]

        user = self.getCurrentUser()
        apiUrl = os.path.dirname(cherrypy.url())

        job = self.model('job', 'jobs').createJob(
            title='sumo kmeans test',
            type='sumo',
            user=user,
            handler='worker_handler')

        item = self.model("item").load(itemId, user=user)
        targetFolder = self.model("folder").load(targetId, user=user)

        jobToken = self.model("job", "jobs").createJobToken(job)

        job['kwargs']['jobInfo'] = workerUtils.jobInfoSpec(
            job=job,
            token=jobToken,
            logPrint=True)

        from .job_specs.kmeans import doc as kmeans
        inputs = deepcopy(kmeans["inputs"])

        inputs['input_path'] = workerUtils.girderInputSpec(
            item,
            resourceType="item",
            token=self.getCurrentToken())

        inputs["has_header"]["data"] = hasHeader
        inputs["num_clusters"]["data"] = int(numClusters)

        outputs = {}
        outputs['centers'] = workerUtils.girderOutputSpec(
            parent=targetFolder,
            # TODO(opadron): make a special-purpose token just for this job in
            # case the user logs out before it finishes.
            token=self.getCurrentToken(),
            parentType="folder",
            name="centers.csv",
            dataType="table",
            dataFormat="csv")

        outputs['clusters'] = workerUtils.girderOutputSpec(
            parent=targetFolder,
            # TODO(opadron): make a special-purpose token just for this job in
            # case the user logs out before it finishes.
            token=self.getCurrentToken(),
            parentType="folder",
            name="clusters.csv",
            dataType="table",
            dataFormat="csv")

        job["kwargs"].update(task=kmeans["task"],
                             inputs=inputs,
                             outputs=outputs)

        job = self.model("job", "jobs").save(job)
        self.model("job", "jobs").scheduleJob(job)

        return self.model("job", "jobs").filter(job, user)

def load(info):
    Osumo._cp_config["tools.staticdir.dir"] = os.path.join(
        os.path.relpath(info["pluginRootDir"],
                        info["config"]["/"]["tools.staticdir.root"]),
        "web-external")

    # Move girder app to /girder, serve sumo app from /
    info["apiRoot"].osumo = Osumo()

    (
        info["serverRoot"],
        info["serverRoot"].girder
    ) = (
        info["apiRoot"].osumo,
        info["serverRoot"]
    )

    info["serverRoot"].api = info["serverRoot"].girder.api
    info["serverRoot"].girder.api

