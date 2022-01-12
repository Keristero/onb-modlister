function create_mod_node(mod_id,mod_data){
    return new ModNode(mod_id,mod_data)
}

class ModNode{
    constructor(mod_id,mod_data){
        this.id = mod_id
        this.data = mod_data
        this.create()
    }
    get_html_element(){
        return this.element
    }
    create(){
        this.update(this.data)
    }
    update(latest_mod_data){
        this.data = latest_mod_data
        if(!this.element){
            this.element = document.createElement('div')
        }
        if(!this.div_name){
            this.div_name = document.createTextNode("")
            this.element.appendChild(this.div_name)
        }
        if(!this.div_text){
            this.div_text = document.createTextNode("")
            this.element.appendChild(this.div_text)
        }
        this.div_name.textContent = this.name
        this.div_text.textContent = this.description
        console.log('updated',this.data?.data?.shortname)
    }
    get description(){
        if(this.data?.data?.description != ""){
            return this.data?.data?.description
        }
        return this.type
    }
    get name(){
        if(this.data?.data?.name != ""){
            return this.data?.data?.name
        }
        if(this.data?.data?.detail?.props?.shortname != ""){
            return this.data?.data?.detail?.props?.shortname
        }
        return this.data.id
    }
}