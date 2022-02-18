
class DetailView{
    constructor(){
        this.update({})
        this.details_to_show = {
            'ID':(mod)=>{return mod.details.id},
            'Uploader':(mod)=>{return mod.details.author_name},
            'Thread':(mod)=>{
                let thread_id = mod?.data?.attachement_data?.thread_id
                let guild_id = mod?.data?.attachement_data?.thread_id
                let attachment_id = mod?.data?.attachement_data?.attachment_id
                if(guild_id && thread_id && attachment_id){
                    return `<a href=discord://discord.com/channels/${guild_id}/${thread_id}/${attachment_id} target="_blank">Discord</a>
                    <a href=https://discord.com/channels/${guild_id}/${thread_id}/${attachment_id} target="_blank">Web</a>`
                }
            },
            'Date':(mod)=>{
                return new Date(mod?.data?.attachement_data?.timestamp).toLocaleDateString();
            }
        }
    }
    set_hidden(should_be_hidden){
        if(should_be_hidden && !this.hidden){
            this.hidden = true
            this.element.style.display = "none"
        }else if(!should_be_hidden && this.hidden){
            this.hidden = false
            this.element.style.display = "block"
        }
    }
    attach_to_element(mod_element){
        if(this.current_parent_element){
            this.current_parent_element.removeChild(this.element)
        }
        this.current_parent_element = mod_element
        this.current_parent_element.appendChild(this.element)
    }
    update(mod){
        this.mod = mod
        console.log(this.details)
        if(!this.element){
            this.element = document.createElement('div')
            this.element.classList.add("detail_view");
            this.element.onclick = ()=>{
                hide_detail_view()
            }
        }
        let new_inner_text = ""
        for(let detail_name in this.details_to_show){
            let detail_value = this.details_to_show[detail_name](mod)
            if(detail_value){
                new_inner_text += `<p>${detail_name}: ${detail_value}</p>`
            }
        }
        this.element.innerHTML = new_inner_text
    }
}

const shared_detail_view = new DetailView()
document.body.appendChild(shared_detail_view.element)

function hide_detail_view(){
    shared_detail_view.set_hidden(true)
}

function display_detail_view_for_mod(mod){
    shared_detail_view.attach_to_element(mod.element)
    shared_detail_view.update(mod)
    shared_detail_view.set_hidden(false)
}

export {display_detail_view_for_mod,hide_detail_view}