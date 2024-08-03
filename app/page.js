'use client'
import Logo from "../public/assets/logo-no-background.png";
import { useState, useEffect } from "react";
import { Box, Stack, Button, Modal, TextField, Typography, CircularProgress} from "@mui/material";
import { auth, provider, signInWithPopup, firestore, onAuthStateChanged } from "@/firebase";
import { collection, query, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore/lite";

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

const ITEMS_PER_PAGE = 9; // Number of items per page

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemname, setItemName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
            bgcolor={'black'}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            paddingX={2}
          >
            <Box display="flex" alignItems="center">
              <img
                src="/assets/logo-no-background.png"
                alt="Logo"
                style={{ width: '150px', height: 'auto', objectFit: 'contain', marginLeft: '10px' }}
              />
              <Typography
                variant={'h4'}
                color={'inherit'}
                textAlign={'left'}
                ml={2}
              >
              </Typography>
            </Box>
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
            width="100vw"
            height="100vh"
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            bgcolor={'black'}
            padding={2}
            paddingBottom={6} // To provide space at the bottom
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
            >
              <Typography variant={'h2'} color={'#fff'} textAlign={'center'} fontSize={20} marginLeft={2}>
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
                  marginRight: '0px',
                  width: '70%'
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
                }}
              >
                Add New Item
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
      
            <Box 
              border={'3px solid #1b1c1c'}
              width="100%" // Set to a larger width
              flex="1" // Ensure the box takes up remaining space
              maxWidth="none" // Set a max width for better responsiveness
              borderRadius={7}
              marginTop="20px" // Add margin for spacing
              padding={2} // Add padding for better spacing
              display="flex"
              flexDirection="column" // Ensures items stack vertically
            >
    
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              paddingX={2}
              marginBottom={2} // Add margin bottom for spacing
            >
              <Box width="50px" textAlign="center" marginLeft={3}>
                <Typography variant={'h3'} color={'#fff'} fontSize={18}>
                  #
                </Typography>
              </Box>
              <Box width="200px" textAlign="left" marginLeft={1}>
                <Typography variant={'h3'} color={'#fff'} fontSize={18}>
                  Item Name
                </Typography>
              </Box>
              <Box width="100px" textAlign="center" marginLeft={-2}>
                <Typography variant={'h3'} color={'#fff'} fontSize={18}>
                  Quantity
                </Typography>
              </Box>
            </Box>
            <Stack
              width="100%"
              spacing={2}
              flex="1" // Ensures stack takes up remaining space
              overflow="auto" // Allows scrolling if content overflows
            >
            {displayedItems.map((item, index) => (
              <Box
                key={item.name}
                width="100%"
                minHeight="50px"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#1b1c1c'}
                paddingX={2}
                borderRadius={4}
              >
                <Box width="50px" textAlign="center" marginLeft={3}>
                  <Typography
                    variant={'h3'}
                    color={'#fff'}
                    fontSize={'18px'}
                  >
                    {index + 1}
                  </Typography>
                </Box>
                <Box width="200px" textAlign="left" marginLeft={1}>
                  <Typography
                    variant={'h3'}
                    color={'#fff'}
                    fontSize={'18px'}
                    overflow={'hidden'}
                    textOverflow={'ellipsis'}
                    whiteSpace={'nowrap'}
                  >
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </Typography>
                </Box>
                <Box width="100px" textAlign="center" marginRight={3}>
                  <Typography
                    variant={'h3'}
                    color={'#fff'}
                    fontSize={'18px'}
                  >
                    {item.quantity}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ 
                      fontSize: '12px',
                      backgroundColor: '#fcd12a',
                      color: 'black',
                      '&:hover': {
                        backgroundColor: 'white',
                        color: 'black',
                      },
                    }}
                    onClick={() => addItem(item.name)}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ 
                      fontSize: '12px',
                      backgroundColor: '#fcd12a',
                      color: 'black',
                      '&:hover': {
                        backgroundColor: 'white',
                        color: 'black',
                      },
                    }}
                    onClick={() => removeItem(item.name)}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>            
            ))}
            </Stack>
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center"
              marginTop="auto" // Push to the bottom
              paddingTop={2} // Optional: Add some padding at the top
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
        </>
      )}
    </>
  );
}
