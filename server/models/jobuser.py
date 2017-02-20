
from girder.models.model_base import AccessControlledModel, ValidationException
from girder.constants import AccessType

class Jobuser(AccessControlledModel):
    def initialize(self):
        self.name = 'jobuser'
        self.ensureIndices(('jobId', 'userId'))

        self.exposeFields(level=AccessType.READ, fields=(
            '_id', 'jobId', 'userId', 'processedFiles'))

    def validate(self, doc):
        doc['processedFiles'] = doc.get('processedFiles', [])

        for modelType, key in (
                (('job', 'jobs'), 'jobId'),
                (('user',), 'userId')):

            childId = doc.get(key)

            if not childId:
                raise ValidationException(
                        'Jobuser {} must not be empty.'.format(key), key)

            childDoc = self.model(*modelType).findOne(
                    {'_id': childId}, fields=['_id'])

            if not childDoc:
                raise ValidationException(
                        ('Jobuser referenced {} not found: {}.'
                            .format(modelType[0], childId)), key)

        for processedFile in doc['processedFiles']:
            fileId = processedFile.get('fileId')
            itemId = processedFile.get('itemId')
            name = processedFile.get('name')

            for key in ('fileId', 'itemId', 'name'):
                if key not in processedFile:
                    raise ValidationException(
                            ('Jobuser processedFile entry must have a {}.'
                                .format(key)),
                            'processedFile')

        return doc

    def createJobuser(self, jobId, userId, processedFiles=[]):
        jobuser = {
            'jobId': jobId,
            'userId': userId,
            'processedFiles': processedFiles
        }

        return self.save(jobuser)

    def appendFile(self, jobuser, fileId, itemId, name):
        pfiles = jobuser.get('processedFiles', [])
        pfiles.append({
            'fileId': fileId,
            'itemId': itemId,
            'name': name
        })

        jobuser['processedFiles'] = pfiles
        return self.save(jobuser)

    def appendFiles(self, jobuser, pfiles):
        pfiles = jobuser.get('processedFiles', [])
        pfiles.extend(pfiles)
        jobuser['processedFiles'] = pfiles
        return self.save(jobuser)

