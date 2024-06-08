import pandas as pd
import psycopg2
from selenium import webdriver
from datetime import datetime
import re
import math
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

# Add a logger
logger = logging.getLogger(__name__)
# Connect to the PostgreSQL database
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="postgres",
    password="0000",
    database="postgres"
)

# Initialize WebDriver
driver = webdriver.Firefox()

driver.set_page_load_timeout(600)

driver.set_script_timeout(600)

# Define the base URLs
base_urls = [
    "https://ventspils.citro.lv/product-category/alkoholiskie-dzerieni/",
    "https://ventspils.citro.lv/product-category/augli-darzeni/",
    "https://ventspils.citro.lv/product-category/berniem/",
    "https://ventspils.citro.lv/product-category/dzerieni/",
    "https://ventspils.citro.lv/product-category/dzivniekiem/",
    "https://ventspils.citro.lv/product-category/galas-zivju-produkti/",
    "https://ventspils.citro.lv/product-category/garsvielas/",
    "https://ventspils.citro.lv/product-category/graudu-izstradajumi/",
    "https://ventspils.citro.lv/product-category/higienas-preces/",
    "https://ventspils.citro.lv/product-category/kafija-teja/",
    "https://ventspils.citro.lv/product-category/konditoreja/"
    "https://ventspils.citro.lv/product-category/konservejumi/",
    "https://ventspils.citro.lv/product-category/kulinarija/",
    "https://ventspils.citro.lv/product-category/maizes-izstradajumi-2/",
    "https://ventspils.citro.lv/product-category/piena-produkti-olas/",
    "https://ventspils.citro.lv/product-category/saimniecibas-preces/",
    "https://ventspils.citro.lv/product-category/saldejums/",
    "https://ventspils.citro.lv/product-category/saldeti-produkti/",
    "https://ventspils.citro.lv/product-category/saldumi-uzkodas/",
    "https://ventspils.citro.lv/product-category/sausas-zupas-buljoni/",

    # Add other URLs as needed
]

selector1 = 'ins span.woocommerce-Price-amount.amount bdi, span.price > span.woocommerce-Price-amount.amount bdi'


total_products_found_count = 0

# Get today's date in the format "YYYY-MM-DD"
today_date = datetime.now()
today_date_str = today_date.strftime("%Y-%m-%d %H:%M:%S")

# Extract Artikuls from the PostgreSQL database
cursor = conn.cursor()
update_query = """
                UPDATE statuss
                SET button_state = false,
                    citro = 'status in-progress';
            """

# Execute the update query
cursor.execute(update_query)
conn.commit()
query = "SELECT  \"id\", \"artikuls\", \"nosaukums\", \"barbora\", \"lats\", \"citro\", \"rimi\" FROM web_preces_db WHERE \"citro\" IS NOT NULL AND TRIM(\"citro\") <> ''"
cursor.execute(query)

columns = [desc[0] for desc in cursor.description]
df = pd.DataFrame(cursor.fetchall(), columns=columns)

cursor.close()

def is_nan_or_empty(value):
    return isinstance(value, float) and math.isnan(value)

# Lists to store found product details
found_product_names = []
found_product_prices = []
found_product_artikuls = []
found_product_id = []
found_product_dates = []
found_product_discount = []
found_product_url = []
found_product_dates_7 = []



for base_url in base_urls:
    title_match = re.search(r"https://ventspils.citro.lv/([^/]+)", base_url)
    title = title_match.group(1) if title_match else "Unknown"
    

    for page_number in range(1, 100):  # Adjusted the range to start from page 1
        url = f"{base_url}page/{page_number}/"
        driver.get(url)
        elements1 = driver.find_elements("css selector", selector1)
        
        button_selector = "input.age_input"
        try:
            button = driver.find_element("css selector", button_selector)
            button.click()
            print(f'Clicked the button with selector: {button_selector}')
        except:
            pass
               
        # price_elements = driver.find_elements("css selector", "div.-oPrice")

        product_elements = driver.find_elements("css selector", "li[data-ean]")
        product_data = []
        product_url = []
        scraped_product_prices = []
        
        for element1 in elements1:
            value1 = element1.text.strip().replace('€', '').replace(',', '.')
            
            scraped_product_prices.append(value1)
                    

            



        for url_element in product_elements:

            href_attribute = url_element.find_element("css selector", "a").get_attribute("href")
            product_url.append(href_attribute)
        
        for product_element in product_elements:
            discounted_price_element = product_element.find_elements("css selector", "del > span.woocommerce-Price-amount.amount > bdi")
            
            if discounted_price_element:
                discounted_price = discounted_price_element[0].text.strip().replace('€', '').replace(',', '.')
                
            else:
                discounted_price = ''
            if discounted_price == '':
                product_data.append(None)
                  
            else:                  
                product_data.append(discounted_price)
        # print(f'discount "{product_data}"')
      
        
        scraped_product_names = [name_element.text.strip() for name_element in driver.find_elements("css selector", "h2.woocommerce-loop-product__title")]
        
        if not scraped_product_names:
            break
        
      
        
        
       
        
        for scraped_name, scraped_price, scraped_discount, scraped_url in zip(scraped_product_names, scraped_product_prices, product_data, product_url):
            scraped_name_cleaned = scraped_name.lower()
            
            # Iterate directly over DataFrame rows
            for index, row in df.iterrows():
                product_name_cleaned = str(row['citro']).strip().lower()
               

                if not is_nan_or_empty(product_name_cleaned) and product_name_cleaned == scraped_name_cleaned:
                    # Extract only the numeric part of the price using regular expressions
                    
                    price_match = re.search(r'(\d+\.\d+)', scraped_price)
                    if price_match:
                        found_product_names.append(scraped_name)
                        found_product_prices.append(float(price_match.group(1)))  # Convert price to float
                        found_product_artikuls.append(row['artikuls'])  # Store the corresponding Artikuls
                        found_product_id.append(row['id']) 
                        found_product_dates.append(today_date_str)
                        found_product_discount.append(scraped_discount)
                        found_product_dates_7.append(today_date_str)
                        found_product_url.append(scraped_url)
                        print(f'Product found in category "{title}" on page {page_number}: {scraped_name}, citro_cena: {price_match.group(1)}, discounted_price: {scraped_discount}, artikuls: {row["artikuls"]}, URL: {scraped_url}')
                        total_products_found_count += 1
                        break  # Break the loop after finding a match
                    else:
                        logger.error(f'Unable to extract price for product "{scraped_name}". No price pattern matched.')
                        logger.error("Values causing the issue: scraped_name='%s', row['artikuls']='%s'", scraped_name, row['artikuls'])
                        all_compared = False  # Set the flag to False if any comparison fails
             
                    
                        
               
            
# Close the browser tab
driver.quit()

print(f'===========================================================')
print(f'Total products found: {total_products_found_count}')
print(f'===========================================================')

# Create a DataFrame for found products with Product Name, Price, and Artikuls
found_products_df = pd.DataFrame({'citro_nosaukums': found_product_names, 'citro_cena': found_product_prices, 'web_preces_id': found_product_id, 'artikuls': found_product_artikuls, 'citro_datums': [today_date_str] * len(found_product_names), 'citro_akcija': found_product_discount,'citro_url': found_product_url, 'citro_datums_7': [today_date_str] * len(found_product_names) })

# Establish a connection to the PostgreSQL database

# Define the table name where you want to insert the data
table_name = 'citro'
history_table_name = 'citro_history'

# Establish a connection to the database
cursor = conn.cursor()

try:
    # Iterate through the rows of the DataFrame and insert or update data in the database tables
    for index, row in found_products_df.iterrows():
    # Convert date to string format before insertion into the database
        values = tuple(str(row[column]) if column == 'citro_cena' else row[column] for column in found_products_df.columns)
        values = list(values)  # Convert tuple to list to modify values
        values[found_products_df.columns.get_loc('citro_datums_7')] = row['citro_datums']  # Assign value from barbora_datums
        values = tuple(values)
        # Check if the product exists in the main table
        check_product_query = f"SELECT * FROM {table_name} WHERE \"artikuls\" = CAST(%s AS text)"
        cursor.execute(check_product_query, (values[found_products_df.columns.get_loc('artikuls')],))
        existing_data = cursor.fetchone()

        if existing_data:
            existing_price = float(existing_data[2])
            new_price = float(values[found_products_df.columns.get_loc('citro_cena')].replace(',', '.'))

            existing_discount_str = existing_data[3]
            existing_discount = float(existing_discount_str) if existing_discount_str else 0.0


            
        

           
            if existing_price != new_price:
                # Price has changed, update both price and date
                update_main_table_query = f"""
                    UPDATE {table_name}
                    SET "citro_nosaukums" = %s, "citro_cena" = %s, "citro_datums" = %s, "citro_datums_7" = %s, citro_akcija = %s, "citro_url" = %s
                    WHERE "artikuls" = CAST(%s AS text)
                """
                cursor.execute(update_main_table_query, (values[found_products_df.columns.get_loc('citro_nosaukums')], values[found_products_df.columns.get_loc('citro_cena')], values[found_products_df.columns.get_loc('citro_datums')],values[found_products_df.columns.get_loc('citro_datums_7')],values[found_products_df.columns.get_loc('citro_akcija')], values[found_products_df.columns.get_loc('citro_url')], values[found_products_df.columns.get_loc('artikuls')]))

                # Insert old row into history table
                insert_history_query = f"""
                    INSERT INTO {history_table_name} ("artikuls", "citro_nosaukums", "citro_cena", "citro_akcija","citro_datums")
                    VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(insert_history_query, (values[found_products_df.columns.get_loc('artikuls')], values[found_products_df.columns.get_loc('citro_nosaukums')], values[found_products_df.columns.get_loc('citro_cena')],values[found_products_df.columns.get_loc('citro_akcija')] , values[found_products_df.columns.get_loc('citro_datums')]))    

                logger.info("Updated main table with new price and date, and inserted old data into history table.")
            else:
                # Prices are the same, update only the date
                update_date_query = f"""
                    UPDATE {table_name}
                    SET "citro_datums" = %s, citro_akcija = %s
                    WHERE "artikuls" = CAST(%s AS text)
                """
                cursor.execute(update_date_query, ( values[found_products_df.columns.get_loc('citro_datums')], values[found_products_df.columns.get_loc('citro_akcija')], values[found_products_df.columns.get_loc('artikuls')]))

              


                logger.info("Prices are the same, updated only the date.")
        
    



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
                INSERT INTO {history_table_name} ("artikuls", "citro_nosaukums", "citro_cena", "citro_akcija","citro_datums")
                VALUES (%s, %s, %s, %s, %s)
            """
            try:
                cursor.execute(insert_history_query, (values[found_products_df.columns.get_loc('artikuls')], values[found_products_df.columns.get_loc('citro_nosaukums')], values[found_products_df.columns.get_loc('citro_cena')],values[found_products_df.columns.get_loc('citro_akcija')] , values[found_products_df.columns.get_loc('citro_datums')]))
                logger.info("Inserted new data into the history table.")
            except Exception as e:
                logger.error(f"Error inserting into {history_table_name}: {e}")
                logger.error("Values causing the issue: %s", values)

    update_query = """
    UPDATE statuss
    SET button_state = true,
        citro = 'status open';
    """
    cursor.execute(update_query)
    conn.commit()
    logger.info("Changes committed successfully.")
except Exception as e:
    conn.rollback()
    logger.error("Error occurred during database operation: %s", e)
    logger.error("Values causing the issue: %s", values)
    logger.exception("Error details:")
    update_query = """
        UPDATE statuss
        SET citro = 'status dead';
    """
  
    cursor.execute(update_query)
finally:
    cursor.close()
    conn.close()

logger.info("Data written to the database successfully.")