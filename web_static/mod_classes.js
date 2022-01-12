function create_mod_node(mod_id,mod_data){
    if(mod_data.data.type == "card"){
        return new CardNode(mod_id,mod_data)
    }else if(mod_data.data.type == "player"){
        return new PlayerNode(mod_id,mod_data)
    }else if(mod_data.data.type == "encounter"){
        return new EncounterNode(mod_id,mod_data)
    }else{
        return new ModNode(mod_id,mod_data)
    }
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
        //clear class list
        this.element.classList.remove(...this.element.classList);
        this.element.classList.add("mod");
        if(!this.p_name){
            this.p_name = document.createElement("p")
            this.p_name.classList.add("name")
            this.element.appendChild(this.p_name)
        }
        this.p_name.textContent = this.name
        if(!this.p_description){
            this.p_description = document.createElement("p")
            this.p_description.classList.add("description")
            this.element.appendChild(this.p_description)
        }
        this.p_description.textContent = this.description

        if(!this.download_link_a){
            this.download_link_a = document.createElement('a')
            this.download_link_a.classList.add("download")
            this.element.appendChild(this.download_link_a)
        }
        this.download_link_a.href = this.download_link
        this.download_link_a.textContent = "Download"

        //meme
        if(!this.nft){
            this.nft = document.createElement('a')
            this.nft.classList.add("nft")
            this.element.appendChild(this.nft)
        }
        this.nft.href = `https://youtu.be/dQw4w9WgXcQ`
        this.nft.textContent = "Buy NFT!"
        
    }
    get download_link(){
        return this.data?.attachement_data?.discord_url
    }
    get description(){
        if(this.data?.data?.description){
            return this.data?.data?.description
        }
        if(this.data?.data?.detail?.props?.long_description){
            return this.data?.data?.detail?.props?.long_description
        }
        if(this.data?.data?.detail?.props?.description){
            return this.data?.data?.detail?.props?.description
        }
        return this.data.type
    }
    get name(){
        if(this.data?.data?.name){
            return this.data?.data?.name
        }
        if(this.data?.data?.detail?.props?.shortname){
            return this.data?.data?.detail?.props?.shortname
        }
        return this.data.data.id
    }
    get preview_link(){
        return `/${this.data?.data?.detail?.preview}`
    }
}

class CardNode extends ModNode{
    constructor(mod_id,mod_data){
        super(mod_id,mod_data)
    }
    update(latest_mod_data){
        super.update(latest_mod_data)
        if(!this.chip_preview){
            this.chip_preview = document.createElement('img')
            this.chip_preview.classList.add("chip_preview")
            this.element.appendChild(this.chip_preview)
        }
        this.chip_preview.src = this.preview_link

        this.element.classList.add(this.card_class)
    }
    get card_class(){
        if(this.data?.data?.detail?.props?.card_class){
            return this.data?.data?.detail?.props?.card_class
        }
        return "Standard"
    }
}

class PlayerNode extends ModNode{
    constructor(mod_id,mod_data){
        super(mod_id,mod_data)
    }
    update(latest_mod_data){
        super.update(latest_mod_data)
        if(!this.player_preview){
            this.player_preview = document.createElement('img')
            this.player_preview.classList.add("player_preview")
            this.element.appendChild(this.player_preview)
        }
        this.player_preview.src = this.preview_link
    }
}

class EncounterNode extends ModNode{
    constructor(mod_id,mod_data){
        super(mod_id,mod_data)
    }
    update(latest_mod_data){
        super.update(latest_mod_data)
        if(!this.encounter_preview){
            this.encounter_preview = document.createElement('img')
            this.element.appendChild(this.encounter_preview)
        }
        this.encounter_preview.src = this.preview_link
    }
}