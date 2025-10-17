-- Function to get completed cards for friend profiles
-- This function bypasses RLS restrictions while maintaining security
-- by verifying friendship status and collection privacy

CREATE OR REPLACE FUNCTION get_friend_completed_cards(
  p_user_collection_id INTEGER,
  p_viewer_id UUID,
  p_owner_id UUID
)
RETURNS TABLE(card_id INTEGER) AS $$
BEGIN
  -- Check if viewer is the owner (can see all)
  IF p_viewer_id = p_owner_id THEN
    RETURN QUERY
    SELECT ucc.card_id
    FROM user_completed_cards ucc
    WHERE ucc.user_collection_id = p_user_collection_id;
    RETURN;
  END IF;

  -- Check if they are friends with accepted status
  IF EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (user_one_id = p_viewer_id AND user_two_id = p_owner_id)
      OR (user_one_id = p_owner_id AND user_two_id = p_viewer_id)
    )
  ) THEN
    -- Check if collection is public
    IF EXISTS (
      SELECT 1 FROM user_collections
      WHERE id = p_user_collection_id AND is_public = true
    ) THEN
      RETURN QUERY
      SELECT ucc.card_id
      FROM user_completed_cards ucc
      WHERE ucc.user_collection_id = p_user_collection_id;
      RETURN;
    END IF;
  END IF;

  -- Return empty if not friends or collection is private
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
