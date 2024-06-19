import pandas as pd
import psycopg2
from selenium import webdriver
from datetime import datetime
import re
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')


logger = logging.getLogger(__name__)

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="postgres",
    password="0000",
    database="postgres"
)

driver = webdriver.Firefox()








base_urls = [
    "https://www.rimi.lv/e-veikals/lv/produkti/augli-un-darzeni/c/SH-2",
    "https://www.rimi.lv/e-veikals/lv/produkti/gatavots-rimi/c/SH-17",
    "https://www.rimi.lv/e-veikals/lv/produkti/veganiem-un-vegetariesiem/c/SH-16",
    "https://www.rimi.lv/e-veikals/lv/produkti/gala-zivis-un-gatava-kulinarija/c/SH-6",
    "https://www.rimi.lv/e-veikals/lv/produkti/piena-produkti-un-olas/c/SH-11",
    "https://www.rimi.lv/e-veikals/lv/produkti/maize-un-konditoreja/c/SH-7",
    "https://www.rimi.lv/e-veikals/lv/produkti/saldetie-edieni/c/SH-12",
    "https://www.rimi.lv/e-veikals/lv/produkti/iepakota-partika/c/SH-4",
    "https://www.rimi.lv/e-veikals/lv/produkti/saldumi-un-uzkodas/c/SH-13",
    "https://www.rimi.lv/e-veikals/lv/produkti/dzerieni/c/SH-5",
    "https://www.rimi.lv/e-veikals/lv/produkti/alkoholiskie-dzerieni/c/SH-1",
    "https://www.rimi.lv/e-veikals/lv/produkti/vina-darzs/c/SH-18",
    "https://www.rimi.lv/e-veikals/lv/produkti/skaistumkopsanai-un-higienai/c/SH-14",
    "https://www.rimi.lv/e-veikals/lv/produkti/zidainiem-un-berniem/c/SH-15",
    "https://www.rimi.lv/e-veikals/lv/produkti/sadzives-kimija/c/SH-10",
    "https://www.rimi.lv/e-veikals/lv/produkti/majdzivniekiem/c/SH-8",
    "https://www.rimi.lv/e-veikals/lv/produkti/majai-darzam-un-atputai/c/SH-3"

    
]

selector1 = 'div.price-tag.card__price span'
cents_selector = 'div.price-tag.card__price div sup'

total_products_found_count = 0


today_date = datetime.now()
today_date_str = today_date.strftime("%Y-%m-%d %H:%M:%S")


cursor = conn.cursor()
update_query = """
                UPDATE statuss
                SET button_state = false,
                    rimi = 'status in-progress';
            """


cursor.execute(update_query)
conn.commit()

query = "SELECT \"id\",\"artikuls\", \"nosaukums\", \"barbora\", \"lats\", \"citro\", \"rimi\" FROM web_preces_db WHERE \"rimi\" IS NOT NULL AND TRIM(\"rimi\") <> ''"
cursor.execute(query)
columns = [desc[0] for desc in cursor.description]
df = pd.DataFrame(cursor.fetchall(), columns=columns)


cursor.close()




found_product_names = []
found_product_prices = []
found_product_artikuls = []
found_product_id = []
found_product_dates = []
found_product_discount = []
found_product_url = []
found_product_dates_7 = []



MAX_RETRIES = 2
# Define the wait time between retries in seconds
WAIT_TIME = 10

retry_count = 0

while retry_count < MAX_RETRIES:
    try:
        for base_url in base_urls:
            title_match = re.search(r"https://www.rimi.lv/([^/]+)", base_url)
            title = title_match.group(1) if title_match else "Unknown"




            for page_number in range(1, 2000):  
                url = f"{base_url}?currentPage={page_number}"
                driver.get(url)
                elements1 = driver.find_elements("css selector", selector1)
                cents_elements = driver.find_elements("css selector", cents_selector)
            

                product_elements = driver.find_elements("css selector", "div.js-product-container")
                product_data = []
                product_url = []
                scraped_product_prices = []
            

                for element1, cents_element in zip(elements1, cents_elements):
                    value1 = element1.text.strip()
                    cents_value = cents_element.text.strip()
                

        
                    matches1 = value1.split()

                    if len(matches1) >= 1:
                        whole_part = matches1[0]

                    
                        if len(cents_value) >= 1:
                            decimal_part = cents_value

                
                            combined_value = f"{whole_part}.{decimal_part}"
                            scraped_product_prices.append(combined_value)
                        else:
                
                            scraped_product_prices.append(whole_part)

        



                for url_element in product_elements:

                    href_attribute = url_element.find_element("css selector", "a").get_attribute("href")
                    product_url.append(href_attribute)
                
                for product_element in product_elements:
                    discounted_price_element = product_element.find_elements("css selector", "div.card__price-wrapper.-has-discount div.old-price-tag.card__old-price span")
                    
                    if discounted_price_element:
                        discounted_price = discounted_price_element[0].text.strip().replace('€', '').replace(',', '.')
                        
                    else:
                        discounted_price = ''
                    if discounted_price == '':
                        product_data.append(None)
                        
                    else:                  
                        product_data.append(discounted_price)
                print(f'discount "{product_data}"')
                if not scraped_product_prices:
                    break
                
                scraped_product_names = [name_element.text.strip() for name_element in driver.find_elements("css selector", "div.card__details p.card__name")]
            
        
            
            
                
                for scraped_name, scraped_price, scraped_discount, scraped_url in zip(scraped_product_names, scraped_product_prices , product_data, product_url):
                    scraped_name_cleaned = scraped_name.lower()

                    for index, row in df.iterrows():
                        product_name_cleaned = str(row['rimi']).strip().lower()

                        if product_name_cleaned and product_name_cleaned == scraped_name_cleaned:
                    
                            price_match = re.search(r'(\d+\.\d+)', scraped_price)
                        
                            if price_match:
                                found_product_names.append(scraped_name)
                                found_product_prices.append(float(price_match.group(1))) 
                                found_product_artikuls.append(row['artikuls'])
                                found_product_id.append(row['id'])
                                found_product_dates.append(today_date_str)  
                                found_product_discount.append(scraped_discount)
                                found_product_dates_7.append(today_date_str)  
                                found_product_url.append(scraped_url)    
                                print(f'Product found in category "{title}" on page {page_number}: {scraped_name}, rimi_cena: {price_match.group(1)}, discounted_price: {scraped_discount}, artikuls: {row["artikuls"]}, URL: {scraped_url}')
                                total_products_found_count += 1
                                break 
                            else:
                                print(f'Unable to extract price for product "{scraped_name}"')
                    

        driver.quit()

        print(f'===========================================================')
        print(f'Total products found: {total_products_found_count}')
        print(f'===========================================================')

        found_products_df = pd.DataFrame({'rimi_nosaukums': found_product_names, 'rimi_cena': found_product_prices, 'web_preces_id': found_product_id,'artikuls': found_product_artikuls, 'rimi_datums': [today_date_str] * len(found_product_names), 'rimi_akcija': found_product_discount,'rimi_url': found_product_url, 'rimi_datums_7': [today_date_str] * len(found_product_names) })


        table_name = 'rimi'
        history_table_name = 'rimi_history'


        cursor = conn.cursor()

        try:
        
            for index, row in found_products_df.iterrows():
            
                values = tuple(str(row[column]) if column == 'rimi_cena' else row[column] for column in found_products_df.columns)
                values = list(values)  
                values[found_products_df.columns.get_loc('rimi_datums_7')] = row['rimi_datums']  
                values = tuple(values)

                check_product_query = f"SELECT * FROM {table_name} WHERE \"artikuls\" = CAST(%s AS text)"
                cursor.execute(check_product_query, (values[found_products_df.columns.get_loc('artikuls')],))
                existing_data = cursor.fetchone()

                if existing_data:
                    existing_price = float(existing_data[2])
                    new_price = float(values[found_products_df.columns.get_loc('rimi_cena')].replace(',', '.'))

                    existing_discount_str = existing_data[3]
                    existing_discount = float(existing_discount_str) if existing_discount_str else 0.0


                    
                

                
                    if existing_price != new_price:
                
                        update_main_table_query = f"""
                            UPDATE {table_name}
                            SET rimi_nosaukums = %s,"rimi_cena" = %s, "rimi_datums" = %s, "rimi_datums_7" = %s, rimi_akcija = %s, rimi_url = %s
                            WHERE "artikuls" = CAST(%s AS text)
                        """
                        cursor.execute(update_main_table_query, (values[found_products_df.columns.get_loc('rimi_nosaukums')], values[found_products_df.columns.get_loc('rimi_cena')], values[found_products_df.columns.get_loc('rimi_datums')],values[found_products_df.columns.get_loc('rimi_datums_7')],values[found_products_df.columns.get_loc('rimi_akcija')],values[found_products_df.columns.get_loc('rimi_url')], values[found_products_df.columns.get_loc('artikuls')]))

                    
                        insert_history_query = f"""
                            INSERT INTO {history_table_name} ("artikuls", "rimi_nosaukums", "rimi_cena", "rimi_akcija","rimi_datums")
                            VALUES (%s, %s, %s, %s, %s)
                        """
                        cursor.execute(insert_history_query, (values[found_products_df.columns.get_loc('artikuls')], values[found_products_df.columns.get_loc('rimi_nosaukums')], values[found_products_df.columns.get_loc('rimi_cena')],values[found_products_df.columns.get_loc('rimi_akcija')] , values[found_products_df.columns.get_loc('rimi_datums')]))    

                        logger.info("Updated main table with new price and date, and inserted old data into history table.")
                    else:
                
                        update_date_query = f"""
                            UPDATE {table_name}
                            SET "rimi_datums" = %s, rimi_akcija = %s
                            WHERE "artikuls" = CAST(%s AS text)
                        """
                        cursor.execute(update_date_query, (values[found_products_df.columns.get_loc('rimi_datums')], values[found_products_df.columns.get_loc('rimi_akcija')], values[found_products_df.columns.get_loc('artikuls')]))

                    


                        logger.info("Prices are the same, updated only the date.")
                
            



                else:
        
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
                        INSERT INTO {history_table_name} ("artikuls", "rimi_nosaukums", "rimi_cena", "rimi_akcija","rimi_datums")
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    try:
                        cursor.execute(insert_history_query, (values[found_products_df.columns.get_loc('artikuls')], values[found_products_df.columns.get_loc('rimi_nosaukums')], values[found_products_df.columns.get_loc('rimi_cena')],values[found_products_df.columns.get_loc('rimi_akcija')] , values[found_products_df.columns.get_loc('rimi_datums')]))
                        logger.info("Inserted new data into the history table.")
                    except Exception as e:
                        logger.error(f"Error inserting into {history_table_name}: {e}")
                        logger.error("Values causing the issue: %s", values)

            update_query = """
            UPDATE statuss
            SET button_state = true,
                rimi = 'status open';
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
                SET rimi = 'status dead';
            """
        
            cursor.execute(update_query)
        finally:
            cursor.close()
            conn.close()

        logger.info("Data written to the database successfully.")
        break
    except Exception as e:
        # Log the exception
        logger.error(f"An error occurred: {str(e)}")

        # Increment the retry count
        retry_count += 1

        # If maximum retries reached, log an error and exit the loop
        if retry_count >= MAX_RETRIES:
            logger.error("Maximum retries reached. Exiting script.")
            cursor = conn.cursor()
            update_query = """
                            UPDATE statuss
                            SET button_state = true,
                                rimi = 'status dead';
                        """
            cursor.execute(update_query)
            conn.commit()
            driver.quit()
            break

        # Wait for a specified time before retrying
        logger.info(f"Waiting for {WAIT_TIME} seconds before retrying...")
        time.sleep(WAIT_TIME)