from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

# Add a logger
logger = logging.getLogger(__name__)
# Initialize the Firefox WebDriver
driver = webdriver.Firefox()

# URL of the webpage you want to scrape
url = 'https://www.e-latts.lv/augli-un-darzeni.2.g'  # Replace with the actual URL

# Open the webpage
driver.get(url)

# Wait for the page to load (you may need to adjust the sleep time)
time.sleep(1)

# Find all product elements with their respective IDs
product_elements = driver.find_elements(By.CSS_SELECTOR,  "div.-oProduct")

# Initialize a list to store product data
product_data = []
logger.info(product_elements)
# Iterate over each product element
for product_element in product_elements:
    # Extract product name
    product_name_element = product_element.find_element(By.CSS_SELECTOR, "a.-oTitle")
    product_name = product_name_element.text.strip()
    
    # Extract the href attribute
    href_attribute = product_element.find_element(By.CSS_SELECTOR, "a").get_attribute("href")
    
    # Append the product data to the list
    product_data.append({"name": product_name, "href": href_attribute})

# Print the combined data
for index, product in enumerate(product_data, start=1):
    print(f"{index} {product}")

# Close the WebDriver
driver.quit()