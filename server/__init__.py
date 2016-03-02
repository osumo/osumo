
import os.path
from girder.api.rest import Resource

class Osumo(Resource):
    # NOTE(opadron): 'tools.staticdir.dir' is set in load()
    _cp_config = {"tools.staticdir.on": True,
                  "tools.staticdir.index": "index.html"}

    def __init__(self):
        super(Osumo, self).__init__()
        self.resourceName = "osumo"

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

