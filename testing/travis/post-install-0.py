
import json
import os.path

from girder.constants import AssetstoreType
from girder_client import GirderClient

def find_user(username):
    result = None
    offset = 0
    while True:
        users = client.get(
            'user',
            parameters=dict(
                text=username,
                limit=50,
                offset=offset,
                sort='login'
            )
        )

        if not users: break

        for user in users:
            if user['login'] == username:
                result = user
                break

        if result:
            break

        offset += 50

    return result

def ensure_user(client, **kwds):
    username = kwds['login']
    password = kwds['password']

    user = find_user(username)
    if user:
        client.put(
            'user/{}'.format(user['_id']),
            parameters=dict(email=kwds['email'],
                            firstName=kwds['firstName'],
                            lastName=kwds['lastName']))

        client.put(
            'user/{}/password'.format(user['_id']),
            parameters=dict(password=password))
    else:
        client.post('user', parameters=dict(
                                login=username,
                                password=password,
                                email=kwds['email'],
                                firstName=kwds['firstName'],
                                lastName=kwds['lastName']))

def find_assetstore(name):
    offset = 0
    limit = 50
    result = None
    while result is None:
        assetstore_list = client.get('assetstore',
                                     parameters=dict(limit=str(limit),
                                                     offset=str(offset)))

        if not assetstore_list:
            break

        for assetstore in assetstore_list:
            if assetstore['name'] == name:
                result = assetstore['_id']
                break

        offset += limit

    return result

client = GirderClient(host='localhost', port=8080)

if find_user('girder'):
    client.authenticate('girder', 'girder')

ensure_user(client,
            login='girder',
            password='girder',
            email='girder@girder.girder',
            firstName='girder',
            lastName='girder')

client.authenticate('girder', 'girder')

if find_assetstore('local') is None:
    client.post('assetstore',
                parameters=dict(name='local',
                                type=str(AssetstoreType.GRIDFS),
                                db='sumoLocalStore',
                                mongohost='mongodb://localhost:27017',
                                replicaset=''))

client.put(
    'system/plugins',
    parameters=dict(plugins=json.dumps(['jobs',
                                        'worker',
                                        'osumo']))
)

