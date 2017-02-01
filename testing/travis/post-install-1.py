
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

client.put('system/setting',
           parameters=dict(list=json.dumps([
               dict(key='worker.broker',
                    value='amqp://guest@localhost'),
               dict(key='worker.backend',
                    value='amqp://guest@localhost'),
               dict(key='core.route_table',
                    value=dict(
                        core_girder='/girder',
                        core_static_root='/static',
                        osumo='/'))])))

