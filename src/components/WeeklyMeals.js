import React, {Component} from 'react'
import { connect } from 'react-redux'
import { fetchRecipes } from '../utils/api'
import { addRecipe, removeFromCalendar } from '../actions'
import { Link } from 'react-router-dom'
import CalendarIcon from 'react-icons/lib/fa/calendar-plus-o'
import DatePicker from 'react-datepicker'
import moment from 'moment'

import StartDateButton from './StartDateButton'
import Header from './Header'


class WeeklyMeals extends Component {
  state = {
    printVersion: false,
    startDate: moment(),
  }

  trim = (str) => (
   str.length > 30
    ? str.slice(0, 30) + '...'
    : str
  )

  handleDateChange = (date) => { 
    this.setState({
      startDate: date
    });
  }

  isWeekday = (date) => {
    const day = date.day()
    return day === 0
  }

  openFoodModal = ({ meal, day }) => {
    this.setState(() => ({
      foodModalOpen: true,
      meal,
      day,
    }))
  }
  closeFoodModal = () => {
    this.setState(() => ({
      foodModalOpen: false,
      meal: null,
      day: null,
      food: null,
    }))
  }
  searchFood = (e) => {
    if (!this.input.value) {
      return
    }

    e.preventDefault()

    this.setState(() => ({ loadingFood: true }))

    fetchRecipes(this.input.value)
      .then((food) => this.setState(() => ({
        food,
        loadingFood: false,
      })))
  }
  printToggle = (e) => {
    e.preventDefault()
    this.setState(() => ({ printVersion: !this.state.printVersion }))
  }

render (){
	const { printVersion } = this.state
    const { calendar, remove } = this.props
    const mealOrder = ['breakfast', 'lunch', 'dinner']
    let printClass =  printVersion ? 'printable' : ''

	return (
		<div id="weekly-meals" className={`container ${printClass}`}>
		
		<Header page={0}
				print={printVersion}
				printAllow={true}
				openIngredientsModal={this.props.shoppingListModal}
				printToggle={this.printToggle} />


		{/* Calendar and Meal Grid */}
        <div className='calendar container'>
          <div className="meal-type-sidebar">
            <ul className="meal-types">
              { mealOrder.map((meal, index) =>
                <li key={index}>{meal.substring(0,1)}</li> )
              }
            </ul>
          </div>


          <div className="week container-fluid">
          <div className="date-selector">
            <DatePicker
              customInput={<StartDateButton />}
              selected={this.state.startDate}
              onChange={this.handleDateChange}
              filterDate={this.isWeekday}
              placeholderText="Select a weekday"
            />
          </div>
           <ul className="day-list">
           {
            calendar.map((day, index) => 
              <li key={index}>
                <h3>{day.day.substring(0,3)}</h3>
                <p></p>
              </li>
            )

           }
           </ul>

          { calendar.map(({day, meals}, index) => 
            <ul key={index} className="day-meals">
           {
            mealOrder.map( (meal, index) =>
                <li key={index} className={meal}>
                {meals[meal]
                  ? <div className="foodcard">
                    <div className="remove-meal">
                      <a href="" onClick={(e) => {e.preventDefault(); remove({meal, day}); }}>x</a>
                    </div>
                    <Link to={`/recipes/${meals[meal].label}`}>
                    <img className="img-fluid"
                      src={meals[meal].image}
                      alt={meals[meal].label}
                       />
                    <h4>{printVersion ? meals[meal].label : this.trim(meals[meal].label)}</h4>
                    </Link>
                    </div>
                  : <button onClick={() => this.props.openAddFoodModal({meal, day})} className='icon-btn'>
                          <CalendarIcon size={26}/>
                    </button>
                }
                </li>
            )
           }
           </ul>
           )
          }

          </div>
        </div>


		</div>
	)
}
}



function mapStateToProps ({ food, calendar }) {
  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  return {
    calendar: dayOrder.map((day) => ({
      day,
      meals: Object.keys(calendar[day]).reduce((meals, meal) => {
        meals[meal] = calendar[day][meal]
          ? food[calendar[day][meal]]
          : null

        return meals
      }, {})
    })),
    food
  }
}

function mapDispatchToProps (dispatch) {
  return {
    selectRecipe: (data) => dispatch(addRecipe(data)),
    remove: (data) => dispatch(removeFromCalendar(data)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WeeklyMeals);