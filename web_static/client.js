const div_mods = document.getElementById('mods')
const div_filters = document.getElementById('filters')
const mod_nodes = {}
//filter_fields is defined in filter.js
let filter = new ModsFilter()

main()

async function main() {
    div_filters.appendChild(filter.get_html_element())
    filter.filter_changed_callback = (filter_id,filter_value)=>{
        filter_mod_list(filter_id,filter_value)
    }

    let mod_list = await get_mod_list()
    update_mod_nodes(mod_list, mod_nodes)
    render_mod_nodes(mod_nodes)
    filter_mod_list('any',"")
}

function filter_mod_list(filter_id,filter_value){
    let filter_data = detail_filters[filter_id]
    //if no filter value is provided, search for wildcard
    if(filter_value == ""){
        filter_value = "."
    }
    let filterRegexp = new RegExp(filter_value,'gi')
    //make a list of all the detail keys to filter against
    let filter_ids;
    if(filter_data.display_name == "Any"){
        filter_ids = Object.keys(detail_filters)
    }else{
        filter_ids = [filter_id]
    }
    //check if each mod should be hidden by comparing the filter_value to the details
    let matches = 0
    for(let mod_id in mod_nodes){
        let mod_node = mod_nodes[mod_id]
        let node_should_be_hidden = true
        for(let filter_id of filter_ids){
            if(!should_node_be_hidden(mod_node,filter_id,filterRegexp)){
                node_should_be_hidden = false
            }
        }
        mod_node.set_hidden(node_should_be_hidden)
        if(!node_should_be_hidden){
            matches++
        }
    }
    //update filter title
    filter.p_name.textContent = `Filter (${matches}) results`

}

function should_node_be_hidden(mod_node,filter_id,regexp){
    let key_value = mod_node.details[filter_id]
    let should_hide = true
    if(key_value == undefined){
        should_hide = true
    }else if(Array.isArray(key_value)){
        for(let value of key_value){
            if(value.match(regexp)){
                should_hide = false
            }
        }
    }else if(key_value.match(regexp)){
        should_hide = false
    }
    return should_hide
}

function get_mod_list() {
    return new Promise(async(resolve, reject) => {
        const request = new Request('/mod_list/', {
            method: 'GET'
        });
        fetch(request).then(response => response.json())
        .then(data => {
            resolve(data)
        })
    })
}

function update_mod_nodes(mod_list, mod_nodes) {
    for (let mod_id in mod_list) {
        let mod_data = mod_list[mod_id]

        if (mod_nodes[mod_id]) {
            //if a mod node already exists for this mod
            mod_nodes[mod_id].update()
        } else {
            let new_mod_node = create_mod_node(mod_id, mod_data)
            mod_nodes[mod_id] = new_mod_node
        }
    }
}

function render_mod_nodes(mod_nodes) {
    for (let mod_id in mod_nodes) {
        let mod_node = mod_nodes[mod_id]
        div_mods.appendChild(mod_node.get_html_element())
    }
}