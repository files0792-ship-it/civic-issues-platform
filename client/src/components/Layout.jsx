import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';



const navCls = ({ isActive }) =>

  `rounded-lg px-3 py-2 text-sm font-medium transition ${

    isActive ? 'bg-civic-600 text-white' : 'text-slate-600 hover:bg-slate-100'

  }`;



export default function Layout({ children }) {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  

  // Check localStorage for admin role

  const isAdmin = localStorage.getItem('role') === 'admin';



  return (

    <div className="min-h-screen flex flex-col">

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">

        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">

          <Link to="/" className="font-display text-xl font-bold text-civic-700">

            Civic Issues

          </Link>

          <nav className="flex flex-wrap items-center gap-1">

            <NavLink to="/" className={navCls} end>

              Feed

            </NavLink>

            {user && (

              <NavLink to="/submit" className={navCls}>

                Report

              </NavLink>

            )}

            {isAdmin && (

              <NavLink to="/admin" className={navCls}>

                Admin

              </NavLink>

            )}

            {!user ? (

              <>

                <NavLink to="/login" className={navCls}>

                  Log in

                </NavLink>

                <NavLink

                  to="/register"

                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"

                >

                  Sign up

                </NavLink>

              </>

            ) : (

              <button

                type="button"

                onClick={() => {

                  logout();

                  navigate('/');

                }}

                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"

              >

                Log out

              </button>

            )}

          </nav>

        </div>

      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">

        Hackathon-ready civic reporting by city

      </footer>

    </div>

  );

}

