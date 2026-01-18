-- Add SELECT policy for admins to view all announcements (active and inactive)
CREATE POLICY "Admins can view all announcements"
  ON public.announcements FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));