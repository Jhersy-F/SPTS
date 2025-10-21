'use client';
import { useState } from 'react';
import { useForm, SubmitHandler, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const uploadSchema = z.object({
  description: z.string().min(1, 'Title/Description is required'),
  type: z.enum(['quiz', 'activity', 'exam'], {
    required_error: 'Type is required',
  }),
  // subjectID is passed as a prop and not part of the form validation
  file: z.custom<File | undefined | null>(() => true).optional(),
});

type UploadFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  subjectID: string; // Subject ID is now a required prop
};


export default function UploadForm({ onSuccess, onCancel, subjectID }: UploadFormProps) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);

  type FormData = z.infer<typeof uploadSchema> & {
    subjectID: string;
    file: File;
  };

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      subjectID: subjectID
    }
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setError('');
    setSubmitting(true);

    try {
      if (!localFile) {
        throw new Error('Please select a file to upload');
      }

      const formData = new FormData();
      // Use the first 100 characters of the description as the title if needed
      const title = data.description.length > 100 
        ? data.description.substring(0, 100) 
        : data.description;
      
      formData.append('title', title);
      formData.append('description', data.description);
      formData.append('type', data.type);
      formData.append('subjectID', subjectID);
      formData.append('file', localFile, localFile.name);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      if (response.ok) {
        onSuccess?.();
      } else {
        setError(responseData.error || 'Failed to upload document');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error uploading document';
      setError(errorMessage);
      console.error('Error uploading document:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-3">
          <label htmlFor="description" className="block text-sm font-medium mb-1">Title/Description</label>
          <textarea
            id="description"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter a title and description for your document"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{(errors.description as FieldError)?.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
          <select
            id="type"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('type')}
          >
            <option value="quiz">Quiz</option>
            <option value="activity">Activity</option>
            <option value="exam">Exam</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{(errors.type as FieldError)?.message}</p>
          )}
        </div>

        <input type="hidden" {...register('subjectID')} />
        
        <div className="flex flex-col gap-3">
          <label htmlFor="file" className="block text-sm font-medium mb-1">File</label>
          <input
            type="file"
            id="file"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setLocalFile(e.target.files?.[0] || null)}
            required
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
}
