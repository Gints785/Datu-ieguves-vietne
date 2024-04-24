from selenium import webdriver
from selenium.webdriver.common.by import By
import time

# Initialize the Firefox WebDriver
driver = webdriver.Firefox()

# URL of the webpage you want to scrape
url = 'https://alkoutlet.lv/vins-un-vina-dzerieni.html/'  # Replace with the actual URL

# Open the webpage
driver.get(url)

# Wait for the page to load (you may need to adjust the sleep time)
time.sleep(1)

# Specify the CSS selectors for the two sets of elements
selector1 = 'span span.price'
cents_selector = 'span span.price'

try:
    # Find all elements with the specified selectors
    elements1 = driver.find_elements(By.CSS_SELECTOR, selector1)
    cents_elements = driver.find_elements(By.CSS_SELECTOR, cents_selector)

    print(f"{elements1}")
    print(f"{cents_elements}")
    # Check if elements are found
    if elements1 and cents_elements:
        print(f"Found {len(elements1)} elements for {selector1}")
        print(f"Found {len(cents_elements)} elements for {cents_selector}")

        # Iterate through both sets
        for element1, cents_element in zip(elements1, cents_elements):
            value1 = element1.text.strip()
            cents_value = cents_element.text.strip()

            # Extract whole and decimal parts
            matches1 = value1.split()

            if len(matches1) >= 1:
                whole_part = matches1[0]

                # Check if there's at least one element in cents
                if len(cents_value) >= 1:
                    decimal_part = cents_value

                    # Combine the values and print the result
                    combined_value = f"{whole_part}.{decimal_part}"
                    print("Extracted Text:", combined_value)
                else:
                    # If cents are missing, print only the whole part
                    print("Extracted Text:", whole_part)
            else:
                print("No matches found in element1")

    else:
        print("No elements found with the specified selectors.")

except Exception as e:
    # Print an error message if an exception occurs
    print(f'Error: {str(e)}')

finally:
    # Close the browser regardless of the outcome
    driver.quit()