function create_mod_node(mod_id,mod_data){
    if(mod_data.data.type == "card"){
        return new CardNode(mod_id,mod_data)
    }else if(mod_data.data.type == "player"){
        return new PlayerNode(mod_id,mod_data)
    }else if(mod_data.data.type == "encounter"){
        return new EncounterNode(mod_id,mod_data)
    }else if(mod_data.data.type == "blocks"){
        return new BlockNode(mod_id,mod_data)
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

        if(!this.preview_window){
            this.preview_window = document.createElement('p')
            this.preview_window.classList.add("preview_window")
            this.element.appendChild(this.preview_window)
        }
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
            this.preview_window.appendChild(this.chip_preview)
        }
        this.chip_preview.src = this.preview_link

        if(!this.chip_icon){
            this.chip_icon = document.createElement('img')
            this.chip_icon.classList.add("chip_icon")
            this.preview_window.appendChild(this.chip_icon)
        }
        this.chip_icon.src = this.icon_link

        this.element.classList.add(this.card_class)
    }
    get card_class(){
        if(this.data?.data?.detail?.props?.card_class){
            return this.data?.data?.detail?.props?.card_class
        }
        return "Standard"
    }
    get icon_link(){
        return `/${this.data?.data?.detail?.icon}`
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
            this.preview_window.appendChild(this.player_preview)
        }
        this.player_preview.src = this.preview_link
    }
}

class BlockNode extends ModNode{
    constructor(mod_id,mod_data){
        super(mod_id,mod_data)
    }
    update(latest_mod_data){
        super.update(latest_mod_data)
        if(!this.block_preview){
            this.block_preview = document.createElement('canvas')
            this.block_preview.width = 128
            this.block_preview.height = 128
            this.block_preview.classList.add("block_preview")
            this.preview_window.appendChild(this.block_preview)
        }
        this.element.classList.add('ncp_block')
        this.render_block(this.block_preview)
    }
    render_block(canvas){
        let shape = this.data.data.detail.shape
        let block_color = this.data.data.detail.color
        let is_program = this.data.data.detail?.is_program
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = block_color
        ctx.strokeStyle = "black"
        ctx.clearRect(0,0,canvas.width,canvas.height)
        let nc_width = 5
        let nc_height = 5
        let block_width = canvas.width/nc_width
        let block_height = canvas.height/nc_height
        for(let block_index = 0; block_index < nc_width * nc_height; block_index++){
            let x = block_index % nc_width
            let y = Math.floor(block_index / nc_height)
            if(shape[block_index] == 1){
                let x_pix = x*block_width
                let y_pix = y*block_height
                ctx.fillRect(x_pix,y_pix,block_width,block_height)
                if(!is_program){
                    ctx.strokeStyle = "rgba(0,0,0,0.2)"
                    ctx.strokeRect(x_pix+block_width/2,y_pix,1,block_height)
                    ctx.strokeRect(x_pix,y_pix+block_height/2,block_width,1)
                }
                ctx.strokeStyle = "black"
                ctx.strokeRect(x_pix,y_pix,block_width,block_height)
            }
        }
    }
}


class EncounterNode extends ModNode{
    constructor(mod_id,mod_data){
        super(mod_id,mod_data)
    }
    update(latest_mod_data){
        super.update(latest_mod_data)

        this.element.classList.add("encounter")

        if(!this.encounter_preview){
            this.encounter_preview = document.createElement('img')
            this.encounter_preview.classList.add("encounter_preview")
            this.preview_window.appendChild(this.encounter_preview)
        }
        this.element.classList.add("encounter_node")
        this.encounter_preview.src = this.preview_link
    }
}