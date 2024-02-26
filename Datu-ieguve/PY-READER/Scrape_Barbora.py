import pandas as pd
from selenium import webdriver
from datetime import datetime
from selenium.webdriver.common.by import By
import re
import psycopg2
import math
import logging

# Read data from Excel file
conn = None  # Initialize the connection variable

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

# Add a logger
logger = logging.getLogger(__name__)

try:
    logger.info("Attempting to establish connection to the database...")
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="0000",
        database="postgres"
    )
    logger.info("Connection to the database established successfully.")
except Exception as e:
    logger.error("Error while establishing connection to the database: %s", e)

# Read data from the PostgreSQL database
query = "SELECT \"artikuls\", \"nosaukums\", \"barbora\", \"lats\", \"citro\", \"rimi\" FROM web_preces_db WHERE \"barbora\" IS NOT NULL AND TRIM(\"barbora\") <> ''"
cursor = conn.cursor()
cursor.execute(query)

# Fetch the data and create a DataFrame
columns = [desc[0] for desc in cursor.description]
data = cursor.fetchall()
df = pd.DataFrame(data, columns=columns)

# Close the database connection
cursor.close()

# Initialize WebDriver
driver = webdriver.Firefox()

# Define the base URLs
base_urls = [
    "https://www.barbora.lv/piena-produkti-un-olas",
    # Add other URLs as needed
]

main_selector = '.tw-mr-0\\.5.tw-text-b-price-sm.tw-font-semibold.lg\\:tw-text-b-price-xl'
cents_selector = 'span.tw-text-b-price-xs.tw-font-semibold.lg\\:tw-text-b-price-lg'

karte_selector = 'span.tw-text-b-paragraph-xs.tw-font-bold.tw-text-gray-400.lg\\:tw-text-b-paragraph-sm'
akcija_selector = 'span.tw-text-b-paragraph-xs.tw-font-bold.tw-text-gray-400.lg\\:tw-text-b-paragraph-sm.tw-line-through.tw-decoration-b-red-500'

found_product_names = []
found_product_prices = []
found_product_artikuls = []
found_product_dates = []
found_product_akcijas = []
found_product_kartes = []

total_products_not_found = 0
max_pages_per_category = float('inf')
total_products_found_count = 0

# Get today's date in the format "YYYY-MM-DD HH:MM:SS"
today_date = datetime.now()
today_date_str = today_date.strftime("%Y-%m-%d %H:%M:%S")

# Extract Artikuls from the database file
product_names_in_db = df['barbora'].tolist()
artikuls_in_db = df['artikuls'].tolist()


def is_nan_or_empty(value):
    return isinstance(value, float) and math.isnan(value)

for base_url in base_urls:
    title_match = re.search(r"https://www.barbora.lv/([^/]+)", base_url)
    if title_match:
        title = title_match.group(1)
    else:
        title = "Unknown"

    products_not_found = 0
    page_number = 1
    products_found_count = 0

    while True:
        url = f"{base_url}?page={page_number}"
        driver.get(url)
        main_elements = driver.find_elements(By.CSS_SELECTOR, main_selector)
        cents_elements = driver.find_elements(By.CSS_SELECTOR, cents_selector)
        kartes_elements = driver.find_elements(By.CSS_SELECTOR, karte_selector)
        akcijas_elements = driver.find_elements(By.CSS_SELECTOR, akcija_selector)

        if not main_elements or not cents_elements:
            break

        scraped_product_names = []
        scraped_product_prices = []
        scraped_product_akcijas = []
        scraped_product_kartes = []

        for main_elements, cents_element, kartes_elements, akcijas_elements in zip(main_elements, cents_elements, kartes_elements, akcijas_elements):
            main_value = main_elements.text.strip()
            cents_value = cents_element.text.strip()
            kartes_value = kartes_elements.text.strip()
            akcijas_value = akcijas_elements.text.strip()

            # Extract whole and decimal parts
            matches = main_value.split()

            if len(matches) >= 1:
                whole_part = matches[0]

                # Check if there's at least one element in cents
                if len(cents_value) >= 1:
                    decimal_part = cents_value

                    # Combine the values
                    combined_value = f"{whole_part}.{decimal_part}"
                    # Replace ',' with '.' for proper formatting
                    combined_value = combined_value.replace(',', '.')
                    scraped_product_prices.append(combined_value)
                else:
                    # If cents are missing, use only the whole part
                    # Replace ',' with '.' for proper formatting
                    whole_part = whole_part.replace(',', '.')
                    scraped_product_prices.append(whole_part)

        while True:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            name_elements = driver.find_elements("css selector", "span.tw-block")
            scraped_product_names.extend([name_element.text.strip() for name_element in name_elements])

            if not driver.find_elements("css selector", "a.pagination-next") or len(found_product_names) == len(scraped_product_names):
                break

        for scraped_name, scraped_price, scraped_akcija, scraped_karte in zip(scraped_product_names, scraped_product_prices, scraped_product_akcijas, scraped_product_kartes):
            scraped_name_cleaned = scraped_name.lower()

            # Check if the scraped name exists in the database product names, and the product name is not empty or NaN
            for product_name, artikuls in zip(product_names_in_db, artikuls_in_db):
                if not is_nan_or_empty(product_name):
                    product_name_cleaned = str(product_name).strip().lower()

                    if product_name_cleaned in scraped_name_cleaned:
                        found_product_names.append(scraped_name)
                        found_product_prices.append(scraped_price)
                        found_product_artikuls.append(artikuls)
                        found_product_dates.append(today_date_str)  
                        found_product_akcijas.append(scraped_akcija.replace(',', '.')) 
                        found_product_kartes.append(scraped_karte.replace(',', '.')) 
                        logger.info(f'Product found in category "{title}" on page {page_number}: {product_name}, barbora_cena: {scraped_price}, barbora_akcija: {scraped_akcija}, barbora_karte: {scraped_karte}, artikuls: {artikuls}')
                        products_found_count += 1
                        break
            else:
                products_not_found += 1

        if len(found_product_names) == len(scraped_product_names) or page_number >= max_pages_per_category:
            break

        page_number += 1

    logger.info(f'Products found in category "{title}": {products_found_count}')
    total_products_not_found += products_not_found
    total_products_found_count += products_found_count

driver.quit()

logger.info(f'===========================================================')
logger.info(f'Total products found: {total_products_found_count}')
logger.info(f'===========================================================')

# Create a DataFrame for found products with Product Name, Price, Artikuls, Akcija, and Karte
found_products_df = pd.DataFrame({
    'barbora_nosaukums': found_product_names,
    'barbora_cena': found_product_prices,
    'artikuls': found_product_artikuls,
    'barbora_datums': [today_date_str] * len(found_product_names),
    'barbora_akcija': found_product_akcijas,
    'barbora_karte': found_product_kartes
})

print(found_products_df)  
# Establish a connection to the PostgreSQL database
try:
    logger.info("Attempting to establish connection to the database...")
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="0000",
        database="postgres"
    )
    logger.info("Connection to the database established successfully.")
except Exception as e:
    logger.error("Error while establishing connection to the database: %s", e)

# Define the table names
table_name = 'barbora'
history_table_name = 'barbora_history'

# Establish a connection to the database
cursor = conn.cursor()

try:
    # Iterate through the rows of the DataFrame and insert or update data in the database tables
    for index, row in found_products_df.iterrows():
        # Convert date to string format before insertion into the database
        values = tuple(str(row[column]) if column == 'barbora_cena' else row[column] for column in found_products_df.columns)
        # Convert empty price to empty string
        values = tuple("" if value == '' else value for value in values)
        # Convert empty akcija and karte to NULL
        values = tuple(None if value == '' else value for value in values)
        print("Values for this iteration:", values) 
        # Check if the product exists in the main table
        check_product_query = f"SELECT * FROM {table_name} WHERE \"artikuls\" = CAST(%s AS text)"
        cursor.execute(check_product_query, (values[found_products_df.columns.get_loc('artikuls')],))
        existing_data = cursor.fetchone()

        if existing_data:
            tolerance = 0.001
            # Product exists in the main table
            existing_price = existing_data[2]
            existing_price = (existing_price,) if not isinstance(existing_price, tuple) else existing_price
            existing_price_float = float(existing_price[0])

            if abs(existing_price_float - float(values[found_products_df.columns.get_loc('barbora_cena')].replace(',', '.'))) > tolerance:
                # Price has changed, update both price and date
                update_main_table_query = f"""
                    UPDATE {table_name}
                    SET "barbora_cena" = %s, "barbora_datums" = %s, "barbora_akcija" = %s, "barbora_karte" = %s
                    WHERE "artikuls" = CAST(%s AS text)
                """
                cursor.execute(update_main_table_query, (values[found_products_df.columns.get_loc('barbora_cena')], values[found_products_df.columns.get_loc('barbora_datums')], values[found_products_df.columns.get_loc('barbora_akcija')], values[found_products_df.columns.get_loc('barbora_karte')], values[found_products_df.columns.get_loc('artikuls')]))

                logger.info("Updated main table with new price, date, akcija, and karte.")
            else:
                # Prices are the same, update only the date
                update_date_query = f"""
                    UPDATE {table_name}
                    SET "barbora_datums" = %s, "barbora_akcija" = %s, "barbora_karte" = %s
                    WHERE "artikuls" = CAST(%s AS text)
                """
                cursor.execute(update_date_query, (values[found_products_df.columns.get_loc('barbora_datums')], values[found_products_df.columns.get_loc('barbora_akcija')], values[found_products_df.columns.get_loc('barbora_karte')], values[found_products_df.columns.get_loc('artikuls')]))

                logger.info("Prices are the same, updated only the date, akcija, and karte.")
        else:
            # Product not found in the main table, insert new data
            insert_query = f"""
                INSERT INTO {table_name} ({', '.join(['"' + col + '"' for col in found_products_df.columns])})
                VALUES ({', '.join(['%s' for _ in found_products_df.columns])})
            """
            try:
                cursor.execute(insert_query, values)
                logger.info("Inserted new data into the main table.")
            except Exception as e:
                logger.error(f"Error inserting into {table_name}: {e}")
                logger.error("Values causing the issue: %s", values)


            # Insert data into history table
            insert_history_query = f"""
                INSERT INTO {history_table_name} ("artikuls", "barbora_nosaukums", "barbora_cena", "barbora_datums", "barbora_akcija", "barbora_karte")
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            try:
                cursor.execute(insert_history_query, (values[found_products_df.columns.get_loc('artikuls')], values[found_products_df.columns.get_loc('barbora_nosaukums')], values[found_products_df.columns.get_loc('barbora_cena')], values[found_products_df.columns.get_loc('barbora_datums')], values[found_products_df.columns.get_loc('barbora_akcija')], values[found_products_df.columns.get_loc('barbora_karte')]))
                logger.info("Inserted new data into the history table.")
            except Exception as e:
                logger.error(f"Error inserting into {history_table_name}: {e}")
                logger.error("Values causing the issue: %s", values)

    # Commit the changes and close the connection
    conn.commit()
    logger.info("Changes committed successfully.")
except Exception as e:
    conn.rollback()
    logger.error("Error occurred during database operation: %s", e)
    logger.error("Values causing the issue: %s", values)
    logger.exception("Error details:")
finally:
    cursor.close()
    conn.close()

logger.info("Data written to the database successfully.")
