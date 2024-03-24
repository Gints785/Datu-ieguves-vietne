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
query = "SELECT \"artikuls\", \"nosaukums\", \"barbora\", \"lats\", \"citro\", \"rimi\" FROM web_preces_db WHERE \"citro\" IS NOT NULL AND TRIM(\"citro\") <> ''"
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
    "https://rezekne.citro.lv/product-category/alkoholiskie-dzerieni/"
    # Add other URLs as needed
]
button_selector = "input.age_input"
selector1 = 'ins span.woocommerce-Price-amount.amount bdi, span.price > span.woocommerce-Price-amount.amount bdi'


try:
    button = driver.find_element(By.CSS_SELECTOR, button_selector)
    button.click()
    print(f'Clicked the button with selector: {button_selector}')
except:
    pass



found_product_names = []
found_product_prices = []
found_product_artikuls = []
found_product_dates = []
found_product_discount = []
found_product_url = []
found_product_dates_7 = []

product_data = []
product_url = []

total_products_not_found = 0
max_pages_per_category = float('inf')
total_products_found_count = 0

# Get today's date in the format "YYYY-MM-DD HH:MM:SS"
today_date = datetime.now()
today_date_str = today_date.strftime("%Y-%m-%d %H:%M:%S")

# Extract Artikuls from the Excel file
product_names_in_db = df['citro'].tolist()
artikuls_in_db = df['artikuls'].tolist()

def is_nan_or_empty(value):
    return isinstance(value, float) and math.isnan(value)




for base_url in base_urls:
    title_match = re.search(r"https://rezekne.citro.lv/([^/]+)", base_url)
    title = title_match.group(1) if title_match else "Unknown"

    products_not_found = 0
    page_number = 1
    products_found_count = 0

    while True:
        url = f"{base_url}page/{page_number}/"
        driver.get(url)
        elements1 = driver.find_elements(By.CSS_SELECTOR, selector1)
        scraped_product_names = []
        scraped_product_prices = []
        scraped_product_akcijas = []
        if not elements1:
            break


        scraped_product_prices.append(elements1)
                

        

       
                
    

       
  
        while True:
            product_elements = driver.find_elements(By.CSS_SELECTOR, "[id^='fti-product-card-category-page-']")


            for url_element in product_elements:

                href_attribute = url_element.find_element(By.CSS_SELECTOR, "a").get_attribute("href")
                product_url.append(href_attribute)
    
  
             
              

            for product_element in product_elements:

                discounted_price_element = product_element.find_elements("css selector", ".tw-flex.tw-flex-shrink-0.tw-flex-row.tw-mr-1 span.tw-text-b-paragraph-xs.tw-font-bold.tw-text-gray-400.lg\\:tw-text-b-paragraph-sm.tw-line-through")
             
                if discounted_price_element:
                    discounted_price = discounted_price_element[0].text.strip().replace('€', '').replace(',', '.')
                else:
                    discounted_price = ''
                if discounted_price == '':
                    product_data.append(None)
                  
                else:
                  
                    product_data.append(discounted_price)

            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            name_elements = driver.find_elements("css selector", "span.tw-block")
            scraped_product_names.extend([name_element.text.strip() for name_element in name_elements])
        
            
            price_elements = driver.find_elements("css selector", "div.b-product-price-current")
            scraped_product_prices.extend([float(price_element.text.strip().replace('€', '').replace(',', '.')) for price_element in price_elements])

      
           
    
            if not driver.find_elements("css selector", "a.pagination-next") or len(found_product_names) == len(scraped_product_names):
                break

        for scraped_name, scraped_price, scraped_discount, scraped_url in zip(scraped_product_names, scraped_product_prices, product_data,product_url):
        
    
            scraped_name_cleaned = scraped_name.lower()

            # Check if the scraped name exists in database the product names, and the product name is not empty or NaN
            for product_name, artikul in zip(product_names_in_db, artikuls_in_db):
                if not is_nan_or_empty(product_name):
                    product_name_cleaned = str(product_name).strip().lower()

                    if product_name_cleaned in scraped_name_cleaned:
                        found_product_names.append(scraped_name)
                        found_product_prices.append(f'{scraped_price}')
                        found_product_artikuls.append(artikul)
                        found_product_dates_7.append(today_date_str)  
                        found_product_discount.append(scraped_discount)
                        found_product_url.append(scraped_url)    
                        found_product_dates.append(today_date_str)  
                        
                        logger.info(f'Product found in category "{title}" on page {page_number}: {product_name}, barbora_cena: {scraped_price}, discounted_price: {scraped_discount}, artikuls: {artikul}, URL: {scraped_url}')
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

# Create a DataFrame for found products with Product Name, Price, and Artikuls
found_products_df = pd.DataFrame({'barbora_nosaukums': found_product_names, 'barbora_cena': found_product_prices, 'artikuls': found_product_artikuls, 'barbora_datums': [today_date_str] * len(found_product_names), 'barbora_akcija': found_product_discount,'barbora_url': found_product_url, 'barbora_datums_7': [today_date_str] * len(found_product_names) })
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
        values = list(values)  # Convert tuple to list to modify values
        values[found_products_df.columns.get_loc('barbora_datums_7')] = row['barbora_datums']  # Assign value from barbora_datums
        values = tuple(values)
        # Check if the product exists in the main table
        check_product_query = f"SELECT * FROM {table_name} WHERE \"artikuls\" = CAST(%s AS text)"
        cursor.execute(check_product_query, (values[found_products_df.columns.get_loc('artikuls')],))
        existing_data = cursor.fetchone()

        if existing_data:
            existing_price = float(existing_data[2])
            new_price = float(values[found_products_df.columns.get_loc('barbora_cena')].replace(',', '.'))

            existing_discount_str = existing_data[4]
            existing_discount = float(existing_discount_str) if existing_discount_str else 0.0


            
            new_discount_str = values[found_products_df.columns.get_loc('barbora_akcija')]
            if new_discount_str and isinstance(new_discount_str, str):
                new_discount_str = new_discount_str.replace(',', '.')
                try:
                    new_discount = float(new_discount_str)
                except ValueError:
                    new_discount = 0.0
            else:
                new_discount = 0.0

            logger.info(existing_discount)
            logger.info(new_discount)
            if existing_price != new_price:
                # Price has changed, update both price and date
                update_main_table_query = f"""
                    UPDATE {table_name}
                    SET "barbora_cena" = %s, "barbora_datums" = %s, "barbora_datums_7" = %s, barbora_akcija = %s
                    WHERE "artikuls" = CAST(%s AS text)
                """
                cursor.execute(update_main_table_query, (values[found_products_df.columns.get_loc('barbora_cena')], values[found_products_df.columns.get_loc('barbora_datums')],values[found_products_df.columns.get_loc('barbora_datums_7')],values[found_products_df.columns.get_loc('barbora_akcija')], values[found_products_df.columns.get_loc('artikuls')]))

                # Insert old row into history table
                insert_history_query = f"""
                    INSERT INTO {history_table_name} ("artikuls", "barbora_nosaukums", "barbora_cena", "barbora_datums", "barbora_akcija")
                    VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(insert_history_query, (existing_data[0], existing_data[1], existing_data[2], existing_data[3],existing_data[4]))

                logger.info("Updated main table with new price and date, and inserted old data into history table.")
            else:
                # Prices are the same, update only the date
                update_date_query = f"""
                    UPDATE {table_name}
                    SET "barbora_datums" = %s, barbora_akcija = %s
                    WHERE "artikuls" = CAST(%s AS text)
                """
                cursor.execute(update_date_query, (values[found_products_df.columns.get_loc('barbora_datums')], values[found_products_df.columns.get_loc('barbora_akcija')], values[found_products_df.columns.get_loc('artikuls')]))

              


                logger.info("Prices are the same, updated only the date.")
            if existing_discount != new_discount:
                insert_history_query = f"""
                    INSERT INTO {history_table_name} ("artikuls", "barbora_nosaukums", "barbora_cena", "barbora_datums", "barbora_akcija")
                    VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(insert_history_query, (existing_data[0], existing_data[1], existing_data[2], existing_data[3],existing_data[4]))        



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

          
            insert_history_query = f"""
                INSERT INTO {history_table_name} ("artikuls", "barbora_nosaukums", "barbora_cena", "barbora_datums", "barbora_akcija")
                VALUES (%s, %s, %s, %s, %s)
            """
            try:
                cursor.execute(insert_history_query, (values[found_products_df.columns.get_loc('artikuls')], values[found_products_df.columns.get_loc('barbora_nosaukums')], values[found_products_df.columns.get_loc('barbora_cena')], values[found_products_df.columns.get_loc('barbora_datums')], values[found_products_df.columns.get_loc('barbora_akcija')]))
                logger.info("Inserted new data into the history table.")
            except Exception as e:
                logger.error(f"Error inserting into {history_table_name}: {e}")
                logger.error("Values causing the issue: %s", values)


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