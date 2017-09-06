import React from 'react';
import axios from 'axios';
import { browserHistory } from 'react-router';
import ReactPaginate from 'react-paginate';

//custom components
import ItemsPage from 'components/catalog/items';
import SearchProp from 'components/catalog/search_prop';
import Properties from 'components/catalog/properties'

import './css/catalog.css';

export default class MainBlock extends React.Component {
	constructor(props){
		super(props);
		this.handleToPriceUpdate  = this.handleToPriceUpdate.bind(this);

		this.state = {
			forcePage:0,
			price: {
				min: 0,
				max: 2000000,
			},
			data: [],
			offset: 0,
			search:'',
			props:[]
		}
	}



loadItemsFromServer() {

	axios.get(`/item`,
		{params:{
			page : this.state.offset,
			search : this.state.search,
			minPrice : this.state.price.min,
			maxPrice : this.state.price.max,
			props : JSON.stringify(this.state.props)
			}
		}).then(response =>
					this.setState({
						data: response.data.doc, 
						pageCount: response.data.total_count })
		);
}


componentDidMount() {
	this.loadItemsFromServer();
}

updateSearch(event){
	this.setState({
		search : event.target.value,
		offset : 0
		}, ()=> this.loadItemsFromServer()
		)
}

handlePageClick = (data) => {
	let selected = data.selected;
	let offset = Math.ceil(selected * 12);

	this.setState({ offset : offset, forcePage : selected}, () => {
		this.loadItemsFromServer();
	});
};

handleToPriceUpdate(priceFromChildren){

	this.setState({ price : priceFromChildren});
	this.handlePageClick({ selected:0 });
	this.loadItemsFromServer();
}

handlePropsAdd(name,value){
	var obj={name:'',value:[]};
			var joined;
			obj.name=name;
			obj.value[0]=value;
			joined = this.state.props.concat(obj);

			for(let i=0;i<this.state.props.length;i++){
				if(this.state.props[i].name==name) {
					 joined = this.state.props;
					 joined[i].value=joined[i].value.concat(value);
				}
			}
			this.setState({props: joined,offset:0},function(){
				this.loadItemsFromServer();
			})
			}

handlePropsRemove(name,value){
				for(let i=0;i<this.state.props.length;i++){
					if (this.state.props[i].name == name) {
						var index = this.state.props[i].value.indexOf(value);
						if (index>-1){
							this.state.props[i].value.splice(index, 1);
						}
						if(this.state.props[i].value.length === 0){
							this.state.props.splice(i, 1)
						}
					}
				}
				this.setState({offset:0},function(){
					this.loadItemsFromServer();
				})
}

addToCart(itemId){
	if( !this.props.isAuth ) {
        browserHistory.push('/login');
	}else{
		axios.put(`/shoppingcart/${itemId}`);
	}
  }

/* RENDER */
render() {
	var handleToPriceUpdate  =   this.handleToPriceUpdate;
	var handlePropsAdd = this.handlePropsAdd;
	var handlePropsRemove = this.handlePropsRemove;
	var data = this.state.data;
	return (
	<div className="general">
		<div className="props">
			<SearchProp  handleToPriceUpdate = {handleToPriceUpdate.bind(this)}/>
			<Properties handlePropsAdd={handlePropsAdd.bind(this)} handlePropsRemove={handlePropsRemove.bind(this)}/>
		</div>
		<div className="catalog">

			<div className="row">
				<div className="col-sm-10 col-md-8 col-md-offset-3">
					<div class="form-group">
						<div class="container-1">
							<label for="exampleInputName2">Search : </label>
							<input type="search" id="search" placeholder="Search..." onChange={this.updateSearch.bind(this)}/>
						</div>
					</div>
				</div>
			</div>


			<div className="itemsBox">
				{data.map((item, index) =>
							<ItemsPage key={index} item={item} addToCart={()=>this.addToCart(item._id)}/>
				)}
			</div>
			<div>
				<ReactPaginate  previousLabel={"previous"}
								nextLabel={"next"}
								breakLabel={<a href="">...</a>}
								breakClassName={"break-me"}
								pageCount={this.state.pageCount}
								marginPagesDisplayed={2}
								pageRangeDisplayed={5}
								forcePage={this.state.forcePage}
								onPageChange={this.handlePageClick}
								containerClassName={"pagination"}
								subContainerClassName={"pages pagination"}
								activeClassName={"active"} />
			</div>
		</div>
	</div>
	);
}
};
