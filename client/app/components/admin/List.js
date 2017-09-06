import React from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { browserHistory, Link, hashHistory } from 'react-router';

import App from './Admin';
import Spinner from './Spinner';

import l from './css/List.css';

export default class List extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			data: [],
			offset: 0
		}
		this.handleClickDelete = this.handleClickDelete.bind(this);
		this.handleClickEdit = this.handleClickEdit.bind(this);
	}
	handleClickDelete(e) {
		var value = e.target.value;
		var that = this;
		axios.delete("/Product/" + value)
			.then(response => {
				that.setState({ loading: true }, () => {
					that.loadDataFromServer();
				});;
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	handleClickEdit(e) {
		var value = e.target.value;
		browserHistory.push({
			pathname: '/admin/create',
			state: value
		});
	}

	loadDataFromServer() {
		axios.get(`/Product?page=${this.state.offset}`).then(response =>	
			this.setState({ data: response.data.doc, pageCount: Math.ceil(response.data.total_count / 10), loading: false }));
	}

	handlePageClick = (data) => {
		let selected = data.selected;
		let offset = Math.ceil(selected * 10);
		this.setState({ offset: offset, loading: true }, () => {
			this.loadDataFromServer();
		});
	};

	componentDidMount() {
		this.loadDataFromServer();
	}

	render() {
		var data = this.state.data;
		return (

			<div>
				<Link to='/admin/create'><button>Add new product</button></Link>

				<div className="mui-container mui-panel container admin-list-wrapper">
					<div className="mui-row">
						<div className="mui-appbar">
							<div className="mui-col-md-10">
								<div className="mui-row">
									<div className="mui-col-md-2 "><div className="mui--text-headline mui--text-center">Title</div></div>
									<div className="mui-col-md-3 "><div className="mui--text-headline mui--text-center">Description</div></div>
									<div className="mui-col-md-1 "><div className="mui--text-headline mui--text-center">Price</div></div>
									<div className="mui-col-md-2 "><div className="mui--text-headline mui--text-center">Tags</div></div>
									<div className="mui-col-md-1 "><div className="mui--text-headline mui--text-center">Image</div></div>
									<div className="mui-col-md-3 "><div className="mui--text-headline mui--text-center">Properties</div></div>
								</div>
							</div>
							<div className="mui-col-md-2">
								<div className="mui-row ">
									<div className="mui-col-md-4 admin-product-item"></div>
									<div className="mui-col-md-4 admin-product-item"></div>
									<div className="mui-col-md-4 admin-product-item"></div>
								</div>
							</div>
						</div>

						<div>
							{this.state.loading ? (<div className="mui--text-center"><Spinner /></div>) : (
								<div>
									{data.map((item, i) =>
										<div key={i} className="mui-panel">
											<div className="mui-col-md-10">
												<div className="mui-row">
													<div className="mui-col-md-2 admin-product-item">{item.title}</div>
													<div className="mui-col-md-3 admin-product-item">{item.desc}</div>
													<div className="mui-col-md-1 admin-product-itemtem">{item.price}</div>
													<div className="mui-col-md-2 admin-product-item">{item.tags.join(', ')}</div>
													<div className="mui-col-md-1 admin-product-item"><img src={item.img[0]} alt={item.title} /></div>
													<div className="mui-col-md-3 admin-product-item">
														{item.properties.map((prop, i) =>
															<div key={i}>
																<span>

																	<b>{prop.name}</b>
																	{prop.value}
																</span>
																<br />
															</div>
														)}

													</div>
												</div>
											</div>
											<div className="mui-col-md-2">
												<div className="mui-row ">
													<div className="mui-col-md-4">{item.accessible ? (<i class="material-icons admin-ico-big">check</i>) : (<i class="material-icons admin-ico-big">close</i>)}</div>
													<div className="mui-col-md-4 admin-btn-center"><button className="mui-btn mui-btn--fab mui-btn--primary" value={item._id} onClick={this.handleClickEdit}><i class="material-icons">mode_edit</i></button></div>
													<div className="mui-col-md-4 admin-btn-center"><button className="mui-btn mui-btn--fab mui-btn--danger" value={item._id} onClick={this.handleClickDelete}><i className="material-icons">delete_forever</i></button></div>
												</div>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
						<ReactPaginate
							previousLabel={"previous"}
							nextLabel={"next"}
							breakLabel={<a class="admin-link">...</a>}
							breakClassName={"break-me"}
							pageCount={this.state.pageCount}
							marginPagesDisplayed={2}
							pageRangeDisplayed={5}
							onPageChange={this.handlePageClick}
							containerClassName={"admin-pagination"}
							pageLinkClassName={"admin-link"}
							subContainerClassName={"pages admin-pagination"}
							activeClassName={"admin-active"}
							previousLinkClassName={"admin-prev"}
							nextLinkClassName={"admin-nex"}
						/>
					</div>
				</div>
			</div>
		);
	}
}







