"""Companion model for jobs created by OSUMO."""

from girder.models.model_base import AccessControlledModel, ValidationException
from girder.constants import AccessType


class Jobuser(AccessControlledModel):
    """Companion model for jobs created by OSUMO.

    Jobuser objects contain additional information about the user that created
    the job, and the list of new Girder files and items created by it.
    """

    def initialize(self):
        """Initialize an empty Jobuser object."""
        self.name = 'jobuser'
        self.ensureIndices(('jobId', 'userId'))

        self.exposeFields(level=AccessType.READ, fields=(
            '_id', 'jobId', 'userId', 'processedFiles'))

    def validate(self, doc):
        """Validate this Jobuser object."""
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
                    'Jobuser referenced {} not found: {}.'.format(
                        modelType[0], childId),
                    key)

        for processedFile in doc['processedFiles']:
            for key in ('fileId', 'itemId', 'name'):
                if key not in processedFile:
                    raise ValidationException(
                        'Jobuser processedFile entry must have a {}.'.format(
                            key),
                        'processedFile')

        return doc

    def createJobuser(self, jobId, userId, processedFiles=[]):
        """Create a new Jobuser object."""
        jobuser = {
            'jobId': jobId,
            'userId': userId,
            'processedFiles': processedFiles
        }

        return self.save(jobuser)

    def appendFile(self, jobuser, fileId, itemId, name):
        """Add a file entry to this object's list of processed files."""
        pfiles = jobuser.get('processedFiles', [])
        pfiles.append({
            'fileId': fileId,
            'itemId': itemId,
            'name': name
        })

        jobuser['processedFiles'] = pfiles
        return self.save(jobuser)

    def appendFiles(self, jobuser, pfiles):
        """Add several file entries to this object's list of processed files."""
        pfiles = jobuser.get('processedFiles', [])
        pfiles.extend(pfiles)
        jobuser['processedFiles'] = pfiles
        return self.save(jobuser)
