import os

def insert(file_path, insert_string):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

        # Kiểm tra xem chuỗi đã tồn tại trong file hay chưa
        if insert_string not in content:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(insert_string + '\n' + content)

def insert_to_file(directory, insert_string):
    for root, dirs, files in os.walk(directory):
        for file_name in files:
            if file_name == 'style.css':
                file_path = os.path.join(root, file_name)
                insert(file_path, insert_string)

# Thay đổi đường dẫn của thư mục chính
main_directory = '../content'
insert_string = '@import url(../custom.css);'

insert_to_file(main_directory, insert_string)
