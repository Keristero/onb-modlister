class HistoryManager{
    constructor(){
        this.load_state_from_url()
        this.url_update_timeout
    }
    load_state_from_url(){
        let params = (new URL(document.location)).searchParams;
        this.state={
            fi:params.get('fi'),
            fv:params.get('fv'),
            si:params.get('si')
        }

    }
    get filter_id(){
        let value = this.state.fi || "any"
        console.log('filter_id = ',value)
        return value
    }
    get filter_value(){
        let value = this.state.fv || ""
        console.log('filter_value = ',value)
        return value
    }
    get sorter_id(){
        let value = this.state.si || "timestamp"
        console.log('sorter_id = ',value)
        return value
    }
    update_page_url(){
        clearTimeout(this.url_update_timeout)
        this.url_update_timeout = setTimeout(()=>{
            let searchParams = new URLSearchParams(this.state);
            window.history.pushState(null,null,`?${searchParams.toString()}`)
        },1000)
    }
    update_filter(filter_id,filter_value){
        this.state.fi = filter_id
        this.state.fv = filter_value
        this.update_page_url()
    }
    update_sorter(sorter_id){
        this.state.si = sorter_id
        this.update_page_url()
    }

}

let history_manager = new HistoryManager()

export {history_manager}