-- Fix Storage Bucket allowed MIME types to support PDF, JPG, and PNG
UPDATE storage.buckets
SET allowed_mime_types = '{image/jpeg, image/png, application/pdf, image/jpg}'
WHERE id = 'kyc-documents';

-- Also ensure the bucket is public if desired (already set in previous script, but good for redundancy)
UPDATE storage.buckets
SET public = true
WHERE id = 'kyc-documents';
