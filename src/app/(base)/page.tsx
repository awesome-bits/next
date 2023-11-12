import { withPage } from "@/hoc"
import { Home } from "."
import { userModes } from "@/constants"

export default withPage(Home, {
  mode: userModes.ANY,
})
