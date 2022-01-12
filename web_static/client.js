const div_mods = document.getElementById('mods')
const mod_nodes = {}

main()

async function main() {
    let mod_list = await get_mod_list()
    update_mod_nodes(mod_list, mod_nodes)
    render_mod_nodes(mod_nodes)
}

function get_mod_list() {
    return new Promise(async(resolve, reject) => {
        const request = new Request('/mod_list/', {
            method: 'GET'
        });
        console.log('yoy')
        fetch(request).then(response => response.json())
        .then(data => {
            console.log(data)
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