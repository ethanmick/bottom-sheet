import type { NextPage } from 'next'
import { Menu } from '../components/menu'

const Home: NextPage = () => {
  return (
    <div>
      <Menu>
        <Menu.Trigger>
          <button>Click Me</button>
        </Menu.Trigger>
        <Menu.BottomSheet>
          <div className="p-4">
            <h3 className="text-xs font-bold text-neutral-400">Sort by</h3>
            <ul>
              <li className="py-2 text-neutral-200">Custom order</li>
              <li className="py-2 text-neutral-200">Title</li>
              <li className="py-2 text-neutral-200">Artist</li>
              <li className="py-2 text-neutral-200">Album</li>
            </ul>
          </div>
        </Menu.BottomSheet>
      </Menu>
    </div>
  )
}

export default Home
