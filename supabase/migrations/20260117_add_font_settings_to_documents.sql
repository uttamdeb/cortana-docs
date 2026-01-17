-- Add font_family and font_size columns to documents table
ALTER TABLE public.documents
ADD COLUMN font_family TEXT DEFAULT 'Arial',
ADD COLUMN font_size TEXT DEFAULT '16';

-- Add comment for documentation
COMMENT ON COLUMN public.documents.font_family IS 'Font family preference for the document (e.g., Arial, Times New Roman, Georgia)';
COMMENT ON COLUMN public.documents.font_size IS 'Font size preference for the document in pixels (e.g., 16, 18, 20)';
