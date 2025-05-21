import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)

def update_range_ids():
    try:
        # First, get all beats that need to be updated
        beats_response = supabase.table('beats').select('id, rid, did').execute()
        beats = beats_response.data
        print(f"Found {len(beats)} beats to process")

        # For each beat, find the corresponding range and update the range_id
        for beat in beats:
            # Find the range that matches both rid and did
            range_response = supabase.table('ranges').select('id').eq('rid', beat['rid']).eq('did', beat['did']).execute()
            
            if not range_response.data:
                print(f"No matching range found for beat {beat['id']} with rid={beat['rid']} and did={beat['did']}")
                continue
            
            range_id = range_response.data[0]['id']
            
            # Update the beat with the range_id
            update_response = supabase.table('beats').update({'range_id': range_id}).eq('id', beat['id']).execute()
            
            if update_response.data:
                print(f"Successfully updated beat {beat['id']} with range_id {range_id}")
            else:
                print(f"Failed to update beat {beat['id']}")

        print("Range ID update completed!")

    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    update_range_ids() 