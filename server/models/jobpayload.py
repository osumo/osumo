"""Companion model for jobs created by OSUMO."""

from girder.models.model_base import AccessControlledModel, ValidationException


class Jobpayload(AccessControlledModel):
    """Companion model for jobs created by OSUMO.

    Job payloads contain additional information about the results of a job,
    including any uploaded or inline data.
    """

    def initialize(self):
        """Initialize an empty Job Payload object."""
        self.name = 'jobpayload'
        self.ensureIndices(('_jobId', '_userId'))

    def createJobpayload(self, jobId, userId, data=None):
        """Create a new Job Payload object."""
        jobpayload = {
            '_jobId': jobId,
            '_userId': userId,
        }

        if data is not None:
            jobpayload.update(data)

        return self.save(jobpayload)

    def validate(self, doc):
        """Validate this Job Payload."""
        for modelType, key in (
                (('job', 'jobs'), '_jobId'),
                (('user',), '_userId')):

            childId = doc.get(key)

            if not childId:
                raise ValidationException(
                    'Jobpayload {} must not be empty.'.format(key),
                    key)

            childDoc = self.model(*modelType).findOne(
                {'_id': childId}, fields=['_id'])

            if not childDoc:
                raise ValidationException(
                    'Jobpayload referenced {} not found: {}.'.format(
                        modelType[0], childId),
                    key)

        return doc
