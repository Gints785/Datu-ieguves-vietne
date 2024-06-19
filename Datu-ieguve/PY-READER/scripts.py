import subprocess
import os
import sys
import psycopg2


script_dir = "C:\\xampp\\htdocs\\Datu-ieguve\\PY-READER\\"


def launch_scripts(scripts):
   
    os.chdir(script_dir)

    for script in scripts:
        try:
            
            subprocess.run(["python", script], check=True)
            print(f"Script {script} executed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error executing script {script}: {e}")
            
            return 1  
    return 0  


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
     
        if (connection):
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")


if __name__ == "__main__":

    scripts_to_execute = sys.argv[1:]


    exit_code = launch_scripts(scripts_to_execute)

  
    if exit_code == 0:
     
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
      
            if (connection):
                cursor.close()
                connection.close()
                print("PostgreSQL connection is closed")
    else:
    
        update_button_state_false()
