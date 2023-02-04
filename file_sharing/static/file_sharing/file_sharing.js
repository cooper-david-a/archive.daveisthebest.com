let form_count_field = document.getElementById("id_access_emails-TOTAL_FORMS");
let access_emails_table = document.getElementById("access_emails_table");
form_count_field.value = `${access_emails_table.rows.length-1}`;
let next_form_index = access_emails_table.rows.length-1;

function addEmail() {    
    let new_row = access_emails_table.insertRow();
    new_row.innerHTML = access_emails_table.rows[1].innerHTML.replaceAll("access_emails-0", `access_emails-${next_form_index}`);
    next_form_index += 1;
    form_count_field.value = `${access_emails_table.rows.length-1}`
}

function deleteEmail(prefix) {
    if (access_emails_table.rows.length > 1) {
        let button_clicked = document.getElementById("delete_button_" + prefix);
        access_emails_table.deleteRow(button_clicked.parentElement.parentElement.rowIndex)
        form_count_field.value = `${access_emails_table.rows.length-1}`;
    }
}
