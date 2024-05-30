import subprocess
import os
import sys
import psycopg2

# Directory containing the Python scripts
script_dir = "C:\\xampp\\htdocs\\Datu-ieguve\\PY-READER\\"

# Function to launch Python scripts sequentially
def launch_scripts(scripts):
    # Change the working directory to the script directory
    os.chdir(script_dir)

    for script in scripts:
        try:
            # Execute the Python script using subprocess.run()
            subprocess.run(["python", script], check=True)
            print(f"Script {script} executed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error executing script {script}: {e}")
            # Exit the loop if an error occurs
            return 1  # Indicate failure
    return 0  # Indicate success

# Update button_state in the database to false
def update_button_state_false():
    try:
        connection = psycopg2.connect(
            host="localhost",
            port=5432,
            user="postgres",
            password="0000",
            database="postgres"
        )

        cursor = connection.cursor()
        cursor.execute("UPDATE statuss SET button_state = true;")
        connection.commit()
    except (Exception, psycopg2.Error) as error:
        print("Error while updating button_state:", error)
    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")

# Execute the function to launch scripts sequentially
if __name__ == "__main__":
    # Get the list of scripts to execute from command-line arguments
    # The first argument (sys.argv[0]) is the script name, so we start from the second argument
    scripts_to_execute = sys.argv[1:]

    # Execute the function to launch scripts sequentially
    exit_code = launch_scripts(scripts_to_execute)

    # Update database based on the exit code
    if exit_code == 0:
        # Update button_state to true
        try:
            connection = psycopg2.connect(
                host="localhost",
                port=5432,
                user="postgres",
                password="0000",
                database="postgres"
            )

            cursor = connection.cursor()
            cursor.execute("UPDATE statuss SET button_state = true;")
            connection.commit()
            print("Updated button_state to true")
        except (Exception, psycopg2.Error) as error:
            print("Error while updating button_state:", error)
        finally:
            # closing database connection.
            if (connection):
                cursor.close()
                connection.close()
                print("PostgreSQL connection is closed")
    else:
        # Update button_state to false if any script fails
        update_button_state_false()
