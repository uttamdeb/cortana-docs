-- Add font_family and font_size columns to documents table
ALTER TABLE public.documents
ADD COLUMN font_family TEXT DEFAULT 'Arial',
ADD COLUMN font_size TEXT DEFAULT '16';