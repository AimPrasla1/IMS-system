'use client'
import Logo from "../public/assets/logo-no-background.png";
import { useState, useEffect } from "react";
import { Box, Stack, Button, Modal, TextField, Typography, CircularProgress,
   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';

import { auth, provider, signInWithPopup, firestore, onAuthStateChanged } from "@/firebase";
import { collection, query, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore/lite";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'black',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const ITEMS_PER_PAGE = 10; // Number of items per page

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemname, setItemName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clickedButton, setClickedButton] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);


  const updateInventory = async (user) => {
    if (!user) return;
    
    const userInventoryRef = collection(firestore, 'users', user.uid, 'inventory');
    const snapshot = query(userInventoryRef);
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };
  
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        updateInventory(currentUser);
      }
      setLoading(false);
    });
  }, []);  

  const addItem = async (item) => {
    if (!user) return;
    
    const lowerCaseItem = item.toLowerCase();
    const userInventoryRef = collection(firestore, `users/${user.uid}/inventory`);
    const docRef = doc(userInventoryRef, lowerCaseItem);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory(user);
  };
  
  const removeItem = async (item) => {
    if (!user) return;
    
    const userInventoryRef = collection(firestore, `users/${user.uid}/inventory`);
    const docRef = doc(userInventoryRef, item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory(user);
  };
  
  const handleClick = (action, itemName) => {
    setClickedButton(action + itemName);
    setTimeout(() => setClickedButton(null), 300); // Reset the button state after 300ms
    if (action === 'add') {
      addItem(itemName);
    } else {
      removeItem(itemName);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;
      setUser(currentUser);
      updateInventory(currentUser);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };
  
  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    setInventory([]);
  };
  
  
  const filteredInventory = inventory.filter((item) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / ITEMS_PER_PAGE));
  const displayedItems = filteredInventory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasNextPage = currentPage < totalPages;


  const data = {
    labels: inventory.map(item => item.name), // Extract item names
    datasets: [
      {
        label: 'Item Count',
        data: inventory.map(item => item.quantity), // Extract item quantities
        backgroundColor: '#fcd12a', // Bar color
        borderRadius: 4, // Rounded corners for the bars
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 10, // Max value for y-axis
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const drawerWidth = 240;

  return (
    <>
      {loading ? (
        <Box
          width="100vw"
          height="100vh"
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          bgcolor={'black'}
        >
          <CircularProgress sx={{color: '#fcd12a'}} />
        </Box>
      ):!user ? (
        <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
        bgcolor={'black'}
        sx={{
          backgroundColor: 'black',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          textAlign: 'center',
          padding: 4,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.0)',
            padding: 4,
            borderRadius: 2,
          }}
        >
          <img 
          src="/assets/logo-no-background.png" 
          alt="Logo" 
          style={{ width: '250px', height: 'auto', objectFit: 'contain', marginBottom: '20px' }} 
          />
          <Typography variant={'h3'} color={'white'} marginBottom={2}>
            
          </Typography>
          <Button
            variant="contained"
            onClick={handleLogin}
            sx={{
              backgroundColor: '#fcd12a',
              color: 'black',
              fontSize: '16px',
              padding: '10px 20px',
              borderRadius: '7px',
              '&:hover': {
                backgroundColor: 'white',
                color: 'black',
              },
            }}
          >
            Sign In with Google
          </Button>
        </Box>
      </Box>
      
      ) : (
        <>
          
          <Box
  width="100%"
  height="80px"
  bgcolor={'#1b1c1c'}
  display={'flex'}
  justifyContent={'space-between'}
  alignItems={'center'}
  paddingX={2}
  position="fixed"
  top={0}
  zIndex={1300} // Make sure it stays above other content
>
  <Drawer
    variant="permanent"
    open={drawerOpen}
    sx={{
      width: drawerOpen ? drawerWidth : 60,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: drawerOpen ? drawerWidth : 60,
        boxSizing: 'border-box',
        backgroundColor: '#1b1c1c',
        color: 'white',
        overflowX: 'hidden',
      },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 80,
        padding: 1,
        paddingLeft: drawerOpen ? 2 : 0, // Adjust padding when open
        paddingRight: drawerOpen ? 2 : 0,
      }}
    >
      {drawerOpen && (
        <img
          src="/assets/logo-no-background.png"
          alt="Logo"
          style={{
            width: '150px',
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      )}
      <IconButton
        edge="end"
        color="inherit"
        aria-label="menu"
        onClick={() => setDrawerOpen(!drawerOpen)}
        sx={{ marginLeft: drawerOpen ? 'auto' : 0, marginLeft: 1 }}
      >
        <MenuIcon sx={{ color: "#fcd12a" }} />
      </IconButton>
    </Box>

    <List>
      <ListItem button>
        <ListItemIcon>
          <InventoryIcon sx={{ color: "#fcd12a" }} />
        </ListItemIcon>
        {drawerOpen && <ListItemText primary="Inventory" />}
      </ListItem>

      <ListItem button>
        <ListItemIcon>
          <ShoppingCartIcon sx={{ color: "#fcd12a" }} />
        </ListItemIcon>
        {drawerOpen && <ListItemText primary="Orders" />}
      </ListItem>

      <ListItem button>
        <ListItemIcon>
          <ShoppingCartIcon sx={{ color: "#fcd12a" }} />
        </ListItemIcon>
        {drawerOpen && <ListItemText primary="Purchases" />}
      </ListItem>

      <ListItem button>
        <ListItemIcon>
          <DashboardIcon sx={{ color: "#fcd12a" }} />
        </ListItemIcon>
        {drawerOpen && <ListItemText primary="Dashboard" />}
      </ListItem>

      <ListItem button>
        <ListItemIcon>
          <BarChartIcon sx={{ color: "#fcd12a" }} />
        </ListItemIcon>
        {drawerOpen && <ListItemText primary="Analytics" />}
      </ListItem>
    </List>
  </Drawer>

  <Box display="flex" alignItems="center" gap={2}>
    <Button
      variant="text"
      color="inherit"
      onClick={() => window.location.reload()}
      sx={{
        backgroundColor: '#fcd12a',
        color: 'black',
        fontSize: '14px',
        '&:hover': {
          backgroundColor: 'white',
          color: 'black',
        },
      }}
    >
      Home
    </Button>
    <Button
      variant="text"
      color="inherit"
      sx={{
        backgroundColor: '#fcd12a',
        color: 'black',
        fontSize: '14px',
        '&:hover': {
          backgroundColor: 'white',
          color: 'black',
        },
      }}
      onClick={handleLogout}
    >
      Logout
    </Button>
  </Box>
</Box>

<Box
  sx={{
    marginTop: '80px', // Adjust for the fixed header
    marginLeft: drawerOpen ? `${drawerWidth}px` : '60px', // Adjust the margin when the drawer is open
    width: `calc(100% - ${drawerOpen ? drawerWidth : 60}px)`, // Adjust width to match the drawer
    padding: 2,
    paddingBottom: 6,
    paddingRight: 6,
    paddingLeft: 3.5,
    backgroundColor: 'black',
  }}
  width="100vw"
  minHeight="100vh"
  display={'flex'}
  flexDirection={'column'}
  alignItems={'center'}
>



            
            <Box display="flex" justifyContent="space-between" width="100%" marginBottom={2} gap={5} overflow="hidden">
    <Box display="flex" flexDirection="column" alignItems="flex-start" flexGrow={1}>
      <Typography sx={{ color: 'white', fontSize: 28 }}>Hello User</Typography>
      <Typography
        sx={{
          color: 'gray',
          fontSize: 20,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Welcome to your Stocked dashboard
      </Typography>
    </Box>

    <Box
      width="20%"
      height="15vh"
      bgcolor="black"
      border="3px solid #1b1c1c"
      borderRadius={4}
    />
    <Box
      width="20%"
      height="15vh"
      bgcolor="black"
      border="3px solid #1b1c1c"
      borderRadius={4}
    />
    <Box
      width="20%"
      height="15vh"
      bgcolor="black"
      border="3px solid #1b1c1c"
      borderRadius={4}
    />
  </Box>
                
            <Box 
              display="flex" 
              justifyContent="space-between" 
              width="100%" 
              minHeight="70vh" 
              marginTop="20px" // Margin at the top for both boxes
              overflow="hidden"
              marginBottom="1px"
              
            >

                    <Box 
                      border={'3px solid #1b1c1c'}
                      width="49%"  // Slightly reduced to allow space for the gap
                      height="65vh"
                      maxWidth="none"
                      borderRadius={7}
                      padding={2}
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"  // Center the chart vertically
                      marginRight="1%"  // Adds a small gap between the two boxes
                    >
                      <Box
                        sx={{
                          width: 'calc(100% - 4px)',  // Full width minus 2 units of margin on each side
                          height: 'calc(100% - 4px)', // Full height minus 2 units of margin on each side
                          margin: 'auto',
                        }}
                      >
                        <Bar data={data} options={options} />
                      </Box>
                    </Box>

            <Box 
              border={'3px solid #1b1c1c'}
              width="49%"  // Same width as the left box
              height="65vh"  
              maxWidth="none"
              borderRadius={7}
              padding={2}
              display="flex"
              flexDirection="column"
              justifyContent="flex-end"
              marginLeft="auto"  // Keeps the box aligned to the right side
            >

            
              <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              height="80px"
              bgcolor={'#1b1c1c'}
              paddingX={2}
              borderRadius={4}
              paddingLeft={2}
              paddingRight={2}
              marginBottom={2}
              sx={{scrollbarWidth: "none", // Hide scrollbar in Firefox
                  "&::-webkit-scrollbar": {
                    display: "none", // Hide scrollbar in Chrome, Safari, Opera
                  },
                }}

      
            >
              <Typography variant={'h2'} color={'#fff'} textAlign={'center'} fontSize={16} marginLeft={2}>
                Inventory Items
              </Typography>
              <TextField
                label="Search"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputLabelProps={{
                  shrink: false,
                  sx: {
                    color: 'white',
                    '&.Mui-focused, &.MuiInputLabel-shrink': {
                      display: 'none',
                    },
                  },
                }}
                InputProps={{
                  sx: {
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                    },
                    '&.MuiOutlinedInput-root': {
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                      },
                    },
                  },
                }}
                sx={{
                  bgcolor: '#262727',
                  color: 'white',
                  borderRadius: 4,
                  width: '50%',
                  '@media (max-width:600px)': {
                    marginRight: '15px', // Adjust right margin for mobile
                    marginLeft: '15px',  // Adjust left margin for mobile
                  }

                }}
              />
              <Button
                variant="contained"
                onClick={handleOpen}
                sx={{
                  backgroundColor: '#fcd12a',
                  color: 'black',
                  fontSize: '14px',
                  '&:hover': {
                    backgroundColor: 'white',
                    color: 'black',
                  },
                  '@media (max-width:600px)': {
                    fontSize: '12px', // Adjust font size for mobile
                    padding: '6px 12px', // Adjust padding for mobile
                  }
                }}
              >
                Add Item
              </Button>
            </Box>
    
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box
                sx={{
                  ...style,
                  borderRadius: 4, // Add border radius to the modal box
                  bgcolor: '#1b1c1c', // Change background color to black
                  color: 'white', // Change text color to white
                }}
              
              >
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ color: 'white' }}>
                  Add Item
                </Typography>
                <Stack width="100%" direction={'row'} spacing={2}>
                  <TextField
                    id="outlined-basic"
                    label="Item"
                    variant="outlined"
                    fullWidth
                    value={itemname}
                    onChange={(e) => setItemName(e.target.value)}
                    sx={{
                      borderRadius: '8px', // Add border radius to the text field
                      '& fieldset': { // Apply border radius to the fieldset
                        borderRadius: '8px',
                      },
                      '& .MuiInputBase-input': {
                        color: 'white', // Change text color inside the text field
                      },
                      '& .MuiInputLabel-root': {
                        color: 'white', // Change label color
                        '&.Mui-focused': {
                          color: '#fcd12a', // Change label color to gold when focused
                        },
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'white', // Change border color
                        },
                        '&:hover fieldset': {
                          borderColor: 'white', // Change border color on hover
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'white', // Change border color when focused
                        },
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      addItem(itemname);
                      setItemName('');
                      handleClose();
                    }}
                    sx={{
                      borderRadius: '8px', // Add border radius to the button
                      color: 'black', // Change button text color to white
                      borderColor: 'black', // Change button border color to white
                      backgroundColor: '#fcd12a', // Change button background color
                      '&:hover': {
                        backgroundColor: 'white', // Change button background color on hover
                        color: 'black', // Change button text color on hover
                      },
                    }}
                  >
                    Add
                  </Button>
                </Stack>
              </Box>
            </Modal>

    <TableContainer component={Paper} sx={{ bgcolor: '#1b1c1c', color: 'white', borderRadius: 4,
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',  // IE and Edge
    'scrollbar-width': 'none',

    }}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: 'white' }}>#</TableCell>
            <TableCell sx={{ color: 'white' }}>Item</TableCell>
            <TableCell sx={{ color: 'white' }}>Quantity</TableCell>
            <TableCell sx={{ color: 'white' }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedItems.map((item, index) => (
            <TableRow key={item.name}>
              <TableCell component="th" scope="row" sx={{ color: 'white', width: '10%' }}>
                {index + 1}
              </TableCell>
              <TableCell sx={{ color: 'white', width: '11%' }}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</TableCell>
              <TableCell sx={{ color: 'white', width: '15%', paddingLeft: '37px'}}>{item.quantity}</TableCell>
              <TableCell align="right" sx={{ width: '20%' }}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleClick('add', item.name)}
                    sx={{
                      fontSize: '12px',
                      backgroundColor: clickedButton === 'add' + item.name ? 'white' : '#fcd12a',
                      color: clickedButton === 'add' + item.name ? 'black' : 'black',
                      '&:hover': {
                        backgroundColor: 'white',
                        color: 'black',
                      },
                      '@media (max-width:600px)': {
                        fontSize: '12px', // Adjust font size for mobile
                        padding: '6px 12px', // Adjust padding for mobile
                      }
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleClick('remove', item.name)}
                    sx={{
                      fontSize: '12px',
                      backgroundColor: clickedButton === 'remove' + item.name ? 'white' : '#fcd12a',
                      color: clickedButton === 'remove' + item.name ? 'black' : 'black',
                      '&:hover': {
                        backgroundColor: 'white',
                        color: 'black',
                      },
                      '@media (max-width:600px)': {
                        fontSize: '12px', // Adjust font size for mobile
                        padding: '6px 12px', // Adjust padding for mobile
                      }
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center"
                marginTop="auto" // Push to the bottom
                paddingTop={2} // Optional: Add some padding at the top
                sx={{
                  scrollbarWidth: "none", // Hide scrollbar in Firefox
                  "&::-webkit-scrollbar": {
                    display: "none", // Hide scrollbar in Chrome, Safari, Opera
                  },
                }}
              >
                <Button
                  variant="contained"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  sx={{
                    backgroundColor: '#fcd12a',
                    color: 'black',
                    '&:hover': {
                      backgroundColor: 'white',
                      color: 'black',
                    },
                  }}
                >
                  Previous
                </Button>
                <Typography variant="body1" marginX={2} color={'white'}>
                  Page {currentPage} of {totalPages}
                </Typography>
                <Button
                  variant="contained"
                  disabled={!hasNextPage}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  sx={{
                    backgroundColor: '#fcd12a',
                    color: 'black',
                    '&:hover': {
                      backgroundColor: 'white',
                      color: 'black',
                    },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Box>
          <Box 
  display="flex" 
  justifyContent="space-between" 
  width="100%"  
>
  <Box
    width="30%" // Adjust to control the size of each box
    minHeight="30vh" // Adjust the height as needed
    bgcolor="black"
    border="1px solid gray" // Gray border
    borderRadius={4} // Border radius of 4
   
  >
    {/* Content for the first box */}
  </Box>

  <Box
    width="30%" 
    minHeight="30vh" 
    bgcolor="black"
    border="1px solid gray" 
    borderRadius={4} 
  >
    {/* Content for the second box */}
  </Box>

  <Box
    width="30%" 
    minHeight="30vh" 
    bgcolor="black"
    border="1px solid gray" 
    borderRadius={4} 
  >
    {/* Content for the third box */}
  </Box>
</Box>
      </Box>
        
      </>
      )}
    </>
  );
}
