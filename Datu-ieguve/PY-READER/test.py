from selenium import webdriver
from selenium.webdriver.common.by import By
import time

# Initialize the Firefox WebDriver
driver = webdriver.Firefox()

# URL of the webpage you want to scrape
url = 'https://www.barbora.lv/piena-produkti-un-olas'  # Replace with the actual URL

# Open the webpage
driver.get(url)

# Wait for the page to load (you may need to adjust the sleep time)
time.sleep(1)

# Specify the CSS selectors for the two sets of elements
selector1 = '.tw-flex.tw-flex-shrink-0.tw-flex-row.tw-mr-1 span.tw-text-b-paragraph-xs.tw-font-bold.tw-text-gray-400.lg\\:tw-text-b-paragraph-sm.tw-line-through.tw-decoration-b-red-500'
cents_selector = '.tw-flex.tw-flex-shrink-0.tw-flex-row.tw-mr-1 span.tw-text-b-paragraph-xs.tw-font-bold.tw-text-gray-400.lg\\:tw-text-b-paragraph-sm'


try:
    # Find all elements with the specified selectors
    elements1 = driver.find_elements(By.CSS_SELECTOR, selector1)
    cents_elements = driver.find_elements(By.CSS_SELECTOR, cents_selector)
    
    # Check if elements are found
    if elements1 and cents_elements:
        print(f"Found {len(elements1)} elements for {selector1}")
        print(f"Found {len(cents_elements)} elements for {cents_selector}")

        # Iterate through both sets
        for element1, cents_element in zip(elements1, cents_elements):
            value1 = element1.text.strip()
            cents_value = cents_element.text.strip()
            
            # Remove euro symbol if present in cents_value
            cents_value = cents_value.replace('€', '')
            
            # Check if cents_value contains the euro symbol
            if '€' in cents_value:
                continue  # Skip the value if it contains the euro symbol
                
            print("Extracted akcija:", value1)
         

    else:
        print("No elements found with the specified selectors.")

except Exception as e:
    # Print an error message if an exception occurs
    print(f'Error: {str(e)}')

finally:
    # Close the browser regardless of the outcome
    driver.quit()