import requests
import psycopg2
import uuid
import os

# Load .env manually if it exists
if os.path.exists(".env"):
    with open(".env") as f:
        for line in f:
            if line.strip() and not line.startswith("#"):
                key, value = line.strip().split("=", 1)
                os.environ[key] = value

# Database Connection Details
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5433")
DB_NAME = os.getenv("POSTGRES_DB", "tiibntick")
DB_USER = os.getenv("DB_USERNAME", "fca")
DB_PASS = os.getenv("DB_PASSWORD", "fca18")

# Cities to fetch: (Name, AreaID, DefaultCityName)
CITIES = [
    ("Yaoundé", 3602746229, "Yaoundé"),
    ("Douala", 3603832073, "Douala")
]

def get_query(area_id):
    return f"""
    [out:json];
    area({area_id})->.searchArea;
    (
      node[~"addr:.*"~"."](area.searchArea);
      way[~"addr:.*"~"."](area.searchArea);
      node["name"]["amenity"](area.searchArea);
    );
    out center body;
    """

def load_addresses():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        cur = conn.cursor()
        
        total_count = 0
        for city_label, area_id, default_city in CITIES:
            print(f"Fetching data from Overpass API for {city_label}...")
            url = "https://overpass-api.de/api/interpreter"
            try:
                query = get_query(area_id)
                response = requests.get(url, params={"data": query}, timeout=120)
                response.raise_for_status()
                data = response.json()
            except Exception as e:
                print(f"Error fetching data for {city_label}: {e}")
                continue

            elements = data.get('elements', [])
            print(f"Found {len(elements)} elements for {city_label}.")

            city_count = 0
            for el in elements:
                tags = el.get('tags', {})
                
                # Map OSM tags to TiiBnTick schema
                street = f"{tags.get('addr:housenumber', '')} {tags.get('addr:street', '')}".strip()
                if not street:
                    street = tags.get('name', '')
                
                city = tags.get('addr:city', default_city)
                district = tags.get('addr:suburb', tags.get('addr:neighbourhood', tags.get('addr:district', default_city)))
                country = tags.get('addr:country', 'Cameroun')
                description = tags.get('amenity', tags.get('description', ''))
                
                lat = el.get('lat') or el.get('center', {}).get('lat')
                lon = el.get('lon') or el.get('center', {}).get('lon')

                if not street:
                    continue

                try:
                    cur.execute(
                        """
                        INSERT INTO addresses (id, street, city, district, type, country, latitude, longitude, description)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """,
                        (str(uuid.uuid4()), street, city, district, 'PRIMARY', country, lat, lon, description)
                    )
                    city_count += 1
                except Exception as e:
                    # Silently skip errors (like duplicates if there were constraints, though there aren't many here)
                    # print(f"Error inserting address {street}: {e}")
                    conn.rollback()
                    continue
            
            conn.commit()
            print(f"Successfully loaded {city_count} addresses for {city_label}.")
            total_count += city_count
        
        cur.close()
        conn.close()
        print(f"Grand total: {total_count} addresses loaded.")

    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    load_addresses()
