import './App.css'
import './index.css'
import { motion } from "framer-motion";
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import logo from './assets/logo/logo.png';
import RestaurantForEdit from './Restaurants/RestaurantForEdit';
import ResImage from './assets/bg/Bg1.png';
import { Link } from 'react-router-dom';
import { FaHome, FaMapMarkedAlt, FaSignInAlt } from "react-icons/fa";
import Navbar from './component/navbar';
import RestaurantNavbar from './component/RestaurantNavbar';
import MainPage from './MainPage';
import RestaurantRegist from './Restaurants/RestaurantsRegist';
import RestaurantLogin from './Restaurants/RestaurantLogin';
import UserRegist from './User/UserRegist';
import UserLogin from './User/UserLogin';
import RestaurantDetail from './RestaurantDetail';
import CompareRestaurant from './CompareRestaurant';
import ResBooking from './ResBooking'
import RestaurantMainPage from './Restaurants/RestaurantMainPage'
import EditProfile from './User/EditProfile'
import RestaurantMap from './component/RestaurantMap';
import UserProfile from './User/UserProfile';
import AllRestaurantsMap from './component/AllRestaurantsMap';
import BookingSettings from './Restaurants/BookingSettings';

function Layout() {
  const location = useLocation();

  const isRestaurantPage = location.pathname.startsWith("/RestaurantFor");

  return (
    <>
      {/* แสดง Navbar หลัก ถ้าไม่ใช่หน้าแรก ("/") และไม่ใช่หน้า Restaurant */}
      {location.pathname !== "/" && !isRestaurantPage && <Navbar />}

      {/* แสดง Navbar ของร้านอาหาร */}
      {isRestaurantPage && <RestaurantNavbar />}

      <Routes>
        <Route path="/" element={
          <div className="w-screen h-screen relative flex flex-col bg-gradient-to-r from-black via-black to-gray-800 text-white font-prompt">
            <img
              src={ResImage}
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover opacity-70 z-0"
            />

            {/* Navbar */}
            <nav className="w-full flex items-center justify-between px-8 py-4">
              {/* โลโก้ */}
              <div className="relative flex items-center space-x-2">
              </div>

              {/* เมนู */}
              <div className="relative flex items-center space-x-12 text-gray-400 text-sm md:text-base">
                <Link to="/main_page" className="flex items-center space-x-1 hover:text-white transition">
                  <FaHome />
                  <span>หน้าหลัก</span>
                </Link>
                <Link to="/AllRestaurantsMap" className="flex items-center space-x-1 hover:text-white transition">
                  <FaMapMarkedAlt />
                  <span>แผนที่</span>
                </Link>
              </div>
            </nav>

            <div className="flex flex-col justify-center items-start flex-grow pl-10">
              {/* Logo with animation */}
              <motion.img
                src={logo}
                alt="FindDine Logo"
                className="relative w-80 h-auto mb-1 drop-shadow-lg"
                initial={{ opacity: 1, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              />

              {/* Title and subtitle */}
              <motion.div
                className="relative text-left pl-5"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                <p className="mt-0 text-lg md:text-xl font-light text-gray-300">
                  Welcome to the Restaurant Comparison System
                </p>
              </motion.div>

              {/* Enter Button */}
              <motion.div
                className="mt-10 pl-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
              >
                <StyledWrapper>
                  <Link to="/main_page">
                    <button className="button">
                      Find Now
                      <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </Link>
                </StyledWrapper>
              </motion.div>
            </div>
          </div>
        } />
        <Route path="/main_page" element={<MainPage />} />
        <Route path="/RestaurantRegist" element={<RestaurantRegist />} />
        <Route path="/RestaurantLogin" element={<RestaurantLogin />} />
        <Route path="/UserRegist" element={<UserRegist />} />
        <Route path="/UserLogin" element={<UserLogin />} />
        <Route path="/RestaurantDetail/:id" element={<RestaurantDetail />} />
        <Route path="/CompareRestaurant" element={<CompareRestaurant />} />
        <Route path="/ResBooking/:id" element={<ResBooking />} />
        <Route path="/RestaurantForMainPage/:id" element={<RestaurantMainPage />} />
        <Route path="/EditProfile" element={<EditProfile />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/RestaurantMap" element={<RestaurantMap />} />
        <Route path="/AllRestaurantsMap" element={<AllRestaurantsMap />} />
        <Route path="/RestaurantForEdit/:id" element={<RestaurantForEdit />} />
        <Route path="/RestaurantForBookingSettings/:id" element={<BookingSettings />} /> 
      </Routes>
    </>
  );
}


export default function IntroPage() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

const StyledWrapper = styled.div`
  .button {
    position: relative;
    transition: all 0.3s ease-in-out;
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
    padding-block: 0.5rem;
    padding-inline: 1.25rem;
    background-color: rgb(196, 75, 11);
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffff;
    gap: 10px;
    font-weight: bold;
    border: 3px solid #ffffff4d;
    outline: none;
    overflow: hidden;
    font-size: 15px;
    cursor: pointer;
  }

  .icon {
    width: 24px;
    height: 24px;
    transition: all 0.3s ease-in-out;
  }

  .button:hover {
    transform: scale(1.05);
    border-color: #fff9;
  }

  .button:hover .icon {
    transform: translate(4px);
  }

  .button:hover::before {
    animation: shine 1.5s ease-out infinite;
  }

  .button::before {
    content: "";
    position: absolute;
    width: 100px;
    height: 100%;
    background-image: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.8),
      rgba(255, 255, 255, 0) 70%
    );
    top: 0;
    left: -100px;
    opacity: 0.6;
  }

  @keyframes shine {
    0% {
      left: -100px;
    }

    60% {
      left: 100%;
    }

    to {
      left: 100%;
    }
  }`;



