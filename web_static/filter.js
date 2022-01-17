const detail_filters = {
    any:{
        display_name:"Any"
    },
    name:{
        display_name:"Name",
    },
    type:{
        display_name:"Mod Type",
    },
    id:{
        display_name:"Package ID",
    },
    card_code:{
        display_name:"Card Code",
    },
    card_class:{
        display_name:"Card Class",
    },
    author_name:{
        display_name:"Author",
    },
}

const sort_options={
    timestamp:{
        display_name:"Date",
        sort:"high-low",
        path:["attachement_data","timestamp"]
    },
    damage:{
        display_name:"Damage",
        sort:"high-low",
        path:["data","detail","props","damage"]
    },
}

const radio_groups={
    type:{
        title:"Mod Type",
        path:["data","type"],
        options:["Card","Encounter"],
        option_values:["card","encounter"]
    }
}

class ModsFilter{
    constructor(){
        this.create()
    }
    get_html_element(){
        return this.element
    }
    create(){
        this.update(this.data)
    }
    filter_changed_callback(){
        console.log('replace this')
    }
    update(){
        if(!this.element){
            this.element = document.createElement('div')
            this.element.classList.add('filter')
        }
        if(!this.p_name){
            this.p_name = document.createElement('p')
            this.p_name.textContent = "Filter"
            this.p_name.classList.add('name')
            this.element.appendChild(this.p_name)
        }
        if(!this.select){
            this.select = document.createElement('select')
            this.element.appendChild(this.select)
            
            for(let field_name in detail_filters){
                let field = detail_filters[field_name]
                let option = document.createElement('option')
                option.value = field_name
                option.textContent = field.display_name
                this.select.appendChild(option)
            }

            this.select.onchange = ()=>{
                let filter_id = this.select.value
                let filter_value = this.input.value
                this.filter_changed_callback(filter_id,filter_value)
            }
        }
        if(!this.input){
            this.input = document.createElement('input')
            this.element.appendChild(this.input)
        }
        this.input.oninput = ()=>{
            let filter_id = this.select.value
            let filter_value = this.input.value
            this.filter_changed_callback(filter_id,filter_value)
        }
    }
}